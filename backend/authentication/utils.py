import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import OTPVerification


def generate_otp():
    """Generate a random 6-digit OTP code."""
    return ''.join(random.choices(string.digits, k=6))


def create_and_send_otp(user):
    """Create an OTP record and send it via email."""
    # Invalidate previous unused OTPs
    OTPVerification.objects.filter(user=user, is_used=False).update(is_used=True)

    otp_code = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=10)

    OTPVerification.objects.create(
        user=user,
        otp_code=otp_code,
        expires_at=expires_at,
    )

    # Send email
    subject = 'Synora - Email Verification OTP'
    message = (
        f'Hello {user.username},\n\n'
        f'Your OTP verification code is: {otp_code}\n\n'
        f'This code expires in 10 minutes.\n\n'
        f'— Synora Team'
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

    return otp_code


def verify_otp(user, otp_code):
    """Verify an OTP code for a user. Returns True if valid."""
    otp = OTPVerification.objects.filter(
        user=user,
        otp_code=otp_code,
        is_used=False,
        expires_at__gt=timezone.now(),
    ).first()

    if otp:
        otp.is_used = True
        otp.save()
        return True
    return False
