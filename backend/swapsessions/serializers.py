from rest_framework import serializers
from .models import Session, SwapRequest


class SessionSerializer(serializers.ModelSerializer):
    user1_name = serializers.CharField(source='user1.username', read_only=True)
    user2_name = serializers.CharField(source='user2.username', read_only=True)
    jitsi_url = serializers.ReadOnlyField()

    class Meta:
        model = Session
        fields = [
            'id', 'user1', 'user2', 'user1_name', 'user2_name',
            'date', 'time', 'duration', 'status', 'room_name',
            'jitsi_url', 'created_at',
        ]
        read_only_fields = ['id', 'room_name', 'jitsi_url', 'created_at']


class SwapRequestSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = SwapRequest
        fields = ['id', 'sender', 'receiver', 'sender_name', 'receiver_name', 'status', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']
