from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer
from authentication.models import User


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def messages(request):
    """GET: list conversations. POST: send a message."""
    if request.method == 'GET':
        # Get unique conversation partners
        sent = Message.objects.filter(sender=request.user).values_list('receiver', flat=True)
        received = Message.objects.filter(receiver=request.user).values_list('sender', flat=True)
        partner_ids = set(list(sent) + list(received))

        conversations = []
        for pid in partner_ids:
            partner = User.objects.get(id=pid)
            last_msg = Message.objects.filter(
                Q(sender=request.user, receiver_id=pid) |
                Q(sender_id=pid, receiver=request.user)
            ).last()
            unread = Message.objects.filter(
                sender_id=pid, receiver=request.user, is_read=False
            ).count()
            conversations.append({
                'user_id': pid,
                'username': partner.username,
                'last_message': last_msg.content[:80] if last_msg else '',
                'last_timestamp': last_msg.timestamp if last_msg else None,
                'unread_count': unread,
            })

        conversations.sort(key=lambda x: x['last_timestamp'] or '', reverse=True)
        return Response(conversations)

    # POST: send message
    receiver_id = request.data.get('receiver')
    content = request.data.get('content')

    if not receiver_id or not content:
        return Response({'error': 'receiver and content are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({'error': 'Receiver not found.'}, status=status.HTTP_404_NOT_FOUND)

    msg = Message.objects.create(sender=request.user, receiver=receiver, content=content)
    return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation(request, user_id):
    """Get all messages between the authenticated user and another user."""
    msgs = Message.objects.filter(
        Q(sender=request.user, receiver_id=user_id) |
        Q(sender_id=user_id, receiver=request.user)
    ).order_by('timestamp')

    # Mark received messages as read
    msgs.filter(sender_id=user_id, receiver=request.user, is_read=False).update(is_read=True)

    serializer = MessageSerializer(msgs, many=True)
    return Response(serializer.data)
