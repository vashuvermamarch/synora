from rest_framework import serializers
from .models import Resource


class ResourceSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    created_by_avatar_seed = serializers.CharField(source='created_by.profile.avatar_seed', read_only=True)
    tags_list = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'image', 'link', 'tags', 'tags_list',
            'created_by', 'created_by_name', 'created_by_avatar_seed', 'created_at',
            'likes_count', 'is_liked', 'is_bookmarked',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def get_likes_count(self, obj):
        return obj.liked_by.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.liked_by.filter(id=request.user.id).exists()
        return False

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarked_by.filter(id=request.user.id).exists()
        return False
