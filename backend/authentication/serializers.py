from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from users.models import Profile, VerificationRequest
from skills.models import Skill


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    skills_to_learn = serializers.ListField(child=serializers.CharField(), required=False)
    skills_to_teach = serializers.ListField(child=serializers.CharField(), required=False)
    certificate = serializers.FileField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password', 'confirm_password', 'role', 'skills_to_learn', 'skills_to_teach', 'certificate']

    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        if password and confirm_password and password != confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        skills_learn = validated_data.pop('skills_to_learn', [])
        skills_teach = validated_data.pop('skills_to_teach', [])
        certificate = validated_data.pop('certificate', None)
        role = validated_data.get('role', 'beginner')

        # Intermediate users start as inactive until admin approval
        is_active = True
        if role == 'intermediate':
            is_active = False

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone=validated_data.get('phone', ''),
            role=role,
            is_active=is_active
        )
        
        # Manually set is_verified as create_user might not handle it in extra_fields for some Django versions
        user.is_verified = False
        user.save()

        # Create Profile
        profile, _ = Profile.objects.get_or_create(user=user)
        
        # Add Skills
        for skill_name in skills_learn:
            if skill_name.strip():
                skill, _ = Skill.objects.get_or_create(name=skill_name.strip().upper())
                profile.skills_to_learn.add(skill)
        
        for skill_name in skills_teach:
            if skill_name.strip():
                skill, _ = Skill.objects.get_or_create(name=skill_name.strip().upper())
                profile.skills_to_teach.add(skill)

        # Create Verification Request for Intermediate users
        if role == 'intermediate' and certificate:
            VerificationRequest.objects.create(user=user, certificate=certificate)

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_verified:
            raise serializers.ValidationError('Email not verified. Please verify your OTP first.')
        if not user.is_active:
            raise serializers.ValidationError('Account is deactivated.')
        data['user'] = user
        return data


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6, min_length=6)


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'is_verified', 'is_active', 'date_joined']
        read_only_fields = ['id', 'is_verified', 'is_active', 'date_joined']
