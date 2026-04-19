from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Session
from .serializers import SessionSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_session(request):
    """Create a new session (generates Jitsi room automatically)."""
    data = request.data.copy()
    data['user1'] = request.user.id

    serializer = SessionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response({
        'message': 'Session created.',
        'data': serializer.data,
    }, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def respond_session(request, pk):
    """Accept or decline a session invitation."""
    try:
        session = Session.objects.get(pk=pk, user2=request.user)
    except Session.DoesNotExist:
        return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in ['accepted', 'declined', 'cancelled']:
        return Response(
            {'error': 'Status must be accepted, declined, or cancelled.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    session.status = new_status
    session.save()
    return Response(SessionSerializer(session).data)


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

    serializer = SessionSerializer(sessions, many=True)
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
    return Response(SessionSerializer(session).data)
