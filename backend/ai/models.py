# Force Reload
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AIConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations')
    title = models.CharField(max_length=255, default='New Conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.user.username})"

class AIChatMessage(models.Model):
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages', null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_chats')
    message = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Chat in {self.conversation.title if self.conversation else 'No Conv'} at {self.created_at}"
