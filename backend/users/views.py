from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from .models import Profile, VerificationRequest
from .serializers import ProfileSerializer, VerificationRequestSerializer


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """Get or update the authenticated user's profile."""
    profile, created = Profile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request, user_id):
    """View another user's profile."""
    try:
        profile = Profile.objects.select_related('user').get(user_id=user_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProfileSerializer(profile)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_verification(request):
    """Submit a verification request (intermediate users)."""
    if request.user.role != 'intermediate':
        return Response(
            {'error': 'Only intermediate users can submit verification requests.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = VerificationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)
    return Response({
        'message': 'Verification request submitted.',
        'data': serializer.data,
    }, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def review_verification(request, pk):
    """Admin: approve or reject a verification request."""
    try:
        vr = VerificationRequest.objects.get(pk=pk)
    except VerificationRequest.DoesNotExist:
        return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in ['approved', 'rejected']:
        return Response({'error': 'Status must be approved or rejected.'}, status=status.HTTP_400_BAD_REQUEST)

    vr.status = new_status
    vr.reviewed_at = timezone.now()
    vr.save()

    if new_status == 'approved':
        vr.user.is_verified = True
        vr.user.save()

    return Response(VerificationRequestSerializer(vr).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_verification_requests(request):
    """List verification requests (admin: all, user: own)."""
    if request.user.is_staff:
        qs = VerificationRequest.objects.all()
    else:
        qs = VerificationRequest.objects.filter(user=request.user)

    serializer = VerificationRequestSerializer(qs, many=True)
    return Response(serializer.data)
