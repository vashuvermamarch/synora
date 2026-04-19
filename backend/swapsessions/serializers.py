from rest_framework import serializers
from .models import Session


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
