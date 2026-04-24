from rest_framework import serializers
from .models import Session, SwapRequest, Rating


class SessionSerializer(serializers.ModelSerializer):
    user1_name = serializers.CharField(source='user1.username', read_only=True)
    user2_name = serializers.CharField(source='user2.username', read_only=True)
    jitsi_url = serializers.ReadOnlyField()
    has_rated = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            'id', 'user1', 'user2', 'user1_name', 'user2_name',
            'date', 'time', 'duration', 'status', 'room_name',
            'jitsi_url', 'has_rated', 'created_at',
        ]
        read_only_fields = ['id', 'room_name', 'jitsi_url', 'created_at']

    def get_has_rated(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.ratings.filter(from_user=request.user).exists()
        return False


class SwapRequestSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = SwapRequest
        fields = ['id', 'sender', 'receiver', 'sender_name', 'receiver_name', 'status', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']


class RatingSerializer(serializers.ModelSerializer):
    from_user_name = serializers.CharField(source='from_user.username', read_only=True)
    to_user_name = serializers.CharField(source='to_user.username', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'session', 'from_user', 'to_user', 'from_user_name', 'to_user_name', 'score', 'comment', 'created_at']
        read_only_fields = ['id', 'from_user', 'to_user', 'created_at']
