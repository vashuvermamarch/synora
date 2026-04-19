from rest_framework import serializers
from .models import Resource


class ResourceSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'image', 'link', 'tags', 'tags_list',
            'created_by', 'created_by_name', 'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def get_tags_list(self, obj):
        return obj.get_tags_list()
