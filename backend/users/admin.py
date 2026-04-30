from django.contrib import admin
from .models import Profile, VerificationRequest


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'created_at']
    search_fields = ['user__username', 'user__email', 'location']


@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'created_at', 'reviewed_at']
    list_filter = ['status']
    actions = ['approve_requests', 'reject_requests']

    @admin.action(description='Approve selected requests')
    def approve_requests(self, request, queryset):
        from django.utils import timezone
        for vr in queryset.filter(status='pending'):
            vr.status = 'approved'
            vr.reviewed_at = timezone.now()
            vr.save()
            vr.user.is_verified = True
            vr.user.save()

    @admin.action(description='Reject selected requests')
    def reject_requests(self, request, queryset):
        from django.utils import timezone
        queryset.filter(status='pending').update(status='rejected', reviewed_at=timezone.now())
