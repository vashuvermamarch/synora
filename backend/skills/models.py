from django.db import models


class Skill(models.Model):
    """A skill that users can learn or teach."""

    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
