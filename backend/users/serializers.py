from rest_framework import serializers
from .models import Profile, VerificationRequest
from skills.models import Skill


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    skills_to_learn = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), many=True, required=False
    )
    skills_to_teach = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), many=True, required=False
    )
    skills_to_learn_names = serializers.SerializerMethodField()
    skills_to_teach_names = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'role', 'bio', 'location', 'avatar',
            'skills_to_learn', 'skills_to_teach',
            'skills_to_learn_names', 'skills_to_teach_names',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_skills_to_learn_names(self, obj):
        return [skill.name for skill in obj.skills_to_learn.all()]

    def get_skills_to_teach_names(self, obj):
        return [skill.name for skill in obj.skills_to_teach.all()]


class VerificationRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = VerificationRequest
        fields = ['id', 'username', 'certificate', 'status', 'created_at', 'reviewed_at']
        read_only_fields = ['id', 'status', 'created_at', 'reviewed_at']
