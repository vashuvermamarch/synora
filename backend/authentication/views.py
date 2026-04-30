from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import (
    SignupSerializer,
    LoginSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    UserSerializer,
)
from .utils import create_and_send_otp, verify_otp


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """Register a new user and send OTP email."""
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        print(f"DEBUG: Signup errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = serializer.save()
        # Send OTP
        try:
            create_and_send_otp(user)
        except Exception as e:
            print(f"DEBUG: OTP sending failed: {str(e)}")
            pass

        return Response({
            'message': 'Account created. Please verify your email with the OTP sent.',
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"DEBUG: Signup save failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Authenticate user and return JWT tokens."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']

    refresh = RefreshToken.for_user(user)

    return Response({
        'message': 'Login successful.',
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        },
        'user': UserSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    """Verify email with OTP code."""
    serializer = VerifyOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        user = User.objects.get(email=serializer.validated_data['email'])
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if verify_otp(user, serializer.validated_data['otp_code']):
        user.is_verified = True
        user.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Email verified successfully.',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': UserSerializer(user).data,
        })

    return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """Resend OTP to user's email."""
    serializer = ResendOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        user = User.objects.get(email=serializer.validated_data['email'])
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        create_and_send_otp(user)
    except Exception:
        pass

    return Response({'message': 'OTP has been resent to your email.'})


@api_view(['POST'])
def logout_view(request):
    """Blacklist the refresh token."""
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully.'})
    except Exception:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def me(request):
    """Get current authenticated user."""
    return Response(UserSerializer(request.user).data)
