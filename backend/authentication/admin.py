from django.contrib import admin
from .models import User, OTPVerification


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'is_verified', 'is_active', 'date_joined']
    list_filter = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email']


@admin.register(OTPVerification)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'otp_code', 'created_at', 'expires_at', 'is_used']
    list_filter = ['is_used']
