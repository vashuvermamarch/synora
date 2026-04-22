from rest_framework import serializers
from .models import Profile, VerificationRequest
from skills.models import Skill


class SkillRelatedField(serializers.RelatedField):
    def get_queryset(self):
        return Skill.objects.all()

    def to_internal_value(self, data):
        # If it's already an ID (integer)
        if isinstance(data, int):
            try:
                return Skill.objects.get(pk=data)
            except Skill.DoesNotExist:
                raise serializers.ValidationError(f"Skill with id {data} does not exist.")
        
        # If it's a string (could be an ID as string or a new skill name)
        if isinstance(data, str):
            data = data.strip()
            if not data:
                raise serializers.ValidationError("Skill name cannot be empty.")
            
            # Check if it's a numeric string (ID)
            if data.isdigit():
                try:
                    return Skill.objects.get(pk=int(data))
                except Skill.DoesNotExist:
                    raise serializers.ValidationError(f"Skill with id {data} does not exist.")
            
            # Otherwise, it's a name. Find or create.
            # We use upper() to maintain consistency with SignupSerializer
            skill, _ = Skill.objects.get_or_create(name=data.upper())
            return skill
            
        raise serializers.ValidationError(f"Expected integer or string, got {type(data)}.")

    def to_representation(self, value):
        return value.id


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    skills_to_learn = SkillRelatedField(many=True, required=False)
    skills_to_teach = SkillRelatedField(many=True, required=False)
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
