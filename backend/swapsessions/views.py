from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Session, SwapRequest, Rating
from .serializers import SessionSerializer, SwapRequestSerializer, RatingSerializer
from chat.models import Message
from notifications.models import Notification


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_session(request):
    """Create a new session (generates Jitsi room automatically)."""
    data = request.data.copy()
    data['user1'] = request.user.id

    serializer = SessionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    session = serializer.save()

    # If this session is created in response to a swap request, mark it accepted
    swap_request_id = request.data.get('swap_request_id')
    if swap_request_id:
        try:
            sr = SwapRequest.objects.get(id=swap_request_id, receiver=request.user)
            sr.status = 'accepted'
            sr.save()
            
            # Automaticaly connect via message
            try:
                Message.objects.create(
                    sender=request.user,
                    receiver=sr.sender,
                    content=f"I've accepted your swap request! I've scheduled our session for {session.date} at {session.time}. Looking forward to it!"
                )
            except Exception as e:
                print(f"Message creation failed: {e}")
        except SwapRequest.DoesNotExist:
            print("SwapRequest not found")
        except Exception as e:
            print(f"SwapRequest update failed: {e}")
    else:
        # If it's a direct session creation (User A schedules directly)
        # Notify user2
        try:
            Notification.objects.create(
                user=session.user2,
                title="New Session Scheduled",
                message=f"{request.user.username} has scheduled a skill swap session with you.",
                type='session'
            )
        except Exception as e:
            print(f"Notification creation failed: {e}")

    return Response({
        'message': 'Session created.',
        'data': SessionSerializer(session, context={'request': request}).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def respond_session(request, pk):
    """Accept or decline a session invitation."""
    try:
        session = Session.objects.get(pk=pk, user2=request.user)
    except Session.DoesNotExist:
        return Response({'error': 'Session not found or not authorized.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in ['accepted', 'declined', 'cancelled']:
        return Response(
            {'error': 'Status must be accepted, declined, or cancelled.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    session.status = new_status
    session.save()

    if new_status == 'accepted':
        try:
            # Automatically connect via message
            Message.objects.create(
                sender=request.user,
                receiver=session.user1,
                content=f"I've accepted your session request for {session.date}. Let's chat!"
            )
            Notification.objects.create(
                user=session.user1,
                title="Session Accepted",
                message=f"{request.user.username} has accepted your session request.",
                type='session'
            )
        except Exception as e:
            print(f"Post-acceptance actions failed: {e}")

    return Response(SessionSerializer(session, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_swap_request(request):
    """Initiate a swap request (User A -> User B)."""
    receiver_id = request.data.get('receiver')
    if not receiver_id:
        return Response({'error': 'Receiver ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if already exists
    if SwapRequest.objects.filter(sender=request.user, receiver_id=receiver_id, status='pending').exists():
        return Response({'error': 'Request already pending.'}, status=status.HTTP_400_BAD_REQUEST)

    sr = SwapRequest.objects.create(sender=request.user, receiver_id=receiver_id)
    
    # Notify Receiver
    Notification.objects.create(
        user=sr.receiver,
        title="New Swap Request",
        message=f"{request.user.username} wants to swap skills with you.",
        type='request'
    )
    
    return Response(SwapRequestSerializer(sr).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_swap_requests(request):
    """List incoming or outgoing swap requests."""
    mode = request.query_params.get('mode', 'received')
    if mode == 'sent':
        requests = SwapRequest.objects.filter(sender=request.user)
    else:
        requests = SwapRequest.objects.filter(receiver=request.user)
    
    serializer = SwapRequestSerializer(requests, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sessions(request):
    """List all sessions for the authenticated user."""
    sessions = Session.objects.filter(
        Q(user1=request.user) | Q(user2=request.user)
    )

    status_filter = request.query_params.get('status')
    if status_filter:
        sessions = sessions.filter(status=status_filter)

    serializer = SessionSerializer(sessions, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def complete_session(request, pk):
    """Mark a session as completed."""
    try:
        session = Session.objects.get(
            pk=pk, status='accepted'
        )
    except Session.DoesNotExist:
        return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.user not in [session.user1, session.user2]:
        return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    session.status = 'completed'
    session.save()
    return Response(SessionSerializer(session, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_session_by_room(request, room_name):
    """Fetch session details using the room name."""
    try:
        session = Session.objects.get(room_name=room_name)
        if request.user not in [session.user1, session.user2]:
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(SessionSerializer(session, context={'request': request}).data)
    except Session.DoesNotExist:
        return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_rating(request):
    """Submit a rating for a session partner."""
    session_id = request.data.get('session_id')
    score = request.data.get('score')
    comment = request.data.get('comment', '')

    try:
        session = Session.objects.get(id=session_id)
    except Session.DoesNotExist:
        return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.user not in [session.user1, session.user2]:
        return Response({'error': 'Not authorized to rate this session.'}, status=status.HTTP_403_FORBIDDEN)

    # Determine who is being rated
    to_user = session.user2 if request.user == session.user1 else session.user1

    # Check if already rated
    if Rating.objects.filter(session=session, from_user=request.user).exists():
        return Response({'error': 'You have already rated this session.'}, status=status.HTTP_400_BAD_REQUEST)

    # Create rating
    rating = Rating.objects.create(
        session=session,
        from_user=request.user,
        to_user=to_user,
        score=score,
        comment=comment
    )

    # Update recipient's profile rating
    profile = to_user.profile
    all_ratings = Rating.objects.filter(to_user=to_user)
    count = all_ratings.count()
    avg = sum(r.score for r in all_ratings) / count
    
    profile.average_rating = avg
    profile.rating_count = count
    profile.save()

    # Also mark session as completed if it wasn't already
    if session.status != 'completed':
        session.status = 'completed'
        session.save()

    return Response({
        'message': 'Rating submitted successfully.',
        'data': RatingSerializer(rating).data
    }, status=status.HTTP_201_CREATED)
