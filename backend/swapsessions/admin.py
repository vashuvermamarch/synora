from django.contrib import admin
from .models import Session


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['user1', 'user2', 'date', 'time', 'duration', 'status', 'room_name']
    list_filter = ['status', 'date']
    search_fields = ['user1__username', 'user2__username', 'room_name']
