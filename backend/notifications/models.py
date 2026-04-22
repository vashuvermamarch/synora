from django.db import models
from django.conf import settings


class Notification(models.Model):
    """User notification."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    title = models.CharField(max_length=100, blank=True)
    message = models.TextField()
    type = models.CharField(max_length=20, default='general')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}"

    class Meta:
        ordering = ['-created_at']
