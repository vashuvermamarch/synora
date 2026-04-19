from django.contrib import admin
from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'tags', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'description', 'tags']
