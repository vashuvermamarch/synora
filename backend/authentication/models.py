from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings


class User(AbstractUser):
    """Custom User model with role-based access."""

    ROLE_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
    ]

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='beginner')
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone']

    def __str__(self):
        return f"{self.username} ({self.email})"


class OTPVerification(models.Model):
    """OTP codes for email verification."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"OTP for {self.user.email} - {self.otp_code}"

    class Meta:
        ordering = ['-created_at']


@receiver(pre_save, sender=User)
def notify_user_activation(sender, instance, **kwargs):
    if instance.pk:
        try:
            previous = sender.objects.get(pk=instance.pk)
            if not previous.is_active and instance.is_active:
                subject = 'Welcome to Synora - Account Activated!'
                message = f'Hi {instance.username},\n\nYour intermediate account has been reviewed and activated by our admin. You can now login to the platform and start teaching!\n\nHappy Learning/Teaching!'
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [instance.email],
                    fail_silently=True,
                )
        except sender.DoesNotExist:
            pass
