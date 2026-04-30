from django.db import models
from django.conf import settings


class Resource(models.Model):
    """A shared learning resource."""

    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='resources/', blank=True, null=True)
    link = models.URLField(blank=True, default='')
    tags = models.CharField(max_length=500, blank=True, default='', help_text='Comma-separated tags')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resources'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='liked_resources', blank=True
    )
    bookmarked_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='bookmarked_resources', blank=True
    )

    def get_tags_list(self):
        return [t.strip() for t in self.tags.split(',') if t.strip()]

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
