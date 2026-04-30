from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q
from .models import Skill
from .serializers import SkillSerializer
from users.models import Profile
from users.serializers import ProfileSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def skill_list(request):
    """List all skills or create a new one."""
    if request.method == 'GET':
        skills = Skill.objects.all()
        search = request.query_params.get('search', '')
        if search:
            skills = skills.filter(name__icontains=search)
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)

    serializer = SkillSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_users(request):
    """
    Find matching users based on skill overlap.
    Returns users whose skills_to_teach match the current user's skills_to_learn
    and vice versa.
    """
    try:
        my_profile = request.user.profile
    except Profile.DoesNotExist:
        return Response({'error': 'Please complete your profile first.'}, status=status.HTTP_400_BAD_REQUEST)

    my_learn = my_profile.skills_to_learn.all()
    my_teach = my_profile.skills_to_teach.all()

    # Find users who teach what I want to learn OR want to learn what I teach
    matches = Profile.objects.filter(
        Q(skills_to_teach__in=my_learn) | Q(skills_to_learn__in=my_teach)
    ).exclude(user=request.user).distinct().select_related('user')

    serializer = ProfileSerializer(matches, many=True)
    return Response(serializer.data)
