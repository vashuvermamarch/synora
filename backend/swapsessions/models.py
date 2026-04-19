import uuid
from django.db import models
from django.conf import settings


class Session(models.Model):
    """A skill swap session between two users, with Jitsi room."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions_initiated'
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions_received'
    )
    date = models.DateField()
    time = models.TimeField()
    duration = models.IntegerField(help_text='Duration in minutes')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    room_name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.room_name:
            self.room_name = f"synora-{self.user1_id}-{self.user2_id}-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    @property
    def jitsi_url(self):
        return f"https://meet.jit.si/{self.room_name}"

    def __str__(self):
        return f"Session: {self.user1.username} ↔ {self.user2.username} on {self.date}"

    class Meta:
        ordering = ['-date', '-time']
