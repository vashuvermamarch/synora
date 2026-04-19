from django.db import models
from django.conf import settings


class Profile(models.Model):
    """User profile with bio, location, and skill preferences."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile'
    )
    bio = models.TextField(blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    skills_to_learn = models.ManyToManyField(
        'skills.Skill', blank=True, related_name='learners'
    )
    skills_to_teach = models.ManyToManyField(
        'skills.Skill', blank=True, related_name='teachers'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.username}"


class VerificationRequest(models.Model):
    """Verification request for intermediate users to prove expertise."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='verification_requests'
    )
    certificate = models.FileField(upload_to='certificates/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Verification: {self.user.username} - {self.status}"

    class Meta:
        ordering = ['-created_at']
