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
        # Switching to meet.ffmuc.net which is a privacy-focused public Jitsi instance 
        # that typically doesn't require login/moderator authentication for new rooms.
        return f"https://meet.ffmuc.net/{self.room_name}#config.prejoinPageEnabled=false"

    def __str__(self):
        return f"Session: {self.user1.username} ↔ {self.user2.username} on {self.date}"

    class Meta:
        ordering = ['-date', '-time']


class SwapRequest(models.Model):
    """Initial request to swap skills before a session is scheduled."""
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='swap_requests_sent'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='swap_requests_received'
    )
    status = models.CharField(
        max_length=20, 
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Swap Request: {self.sender.username} → {self.receiver.username}"


class Rating(models.Model):
    """Rating given by a user to another after a session."""
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='ratings')
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings_given'
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings_received'
    )
    score = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'from_user')
        ordering = ['-created_at']

    def __str__(self):
        return f"Rating: {self.from_user.username} → {self.to_user.username} ({self.score})"
