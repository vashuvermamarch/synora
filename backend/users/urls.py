from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.my_profile, name='user-profile'),
    path('profile/<int:user_id>/', views.user_profile, name='user-profile-detail'),
    path('verify-request/', views.submit_verification, name='user-verify-request'),
    path('verify-request/<int:pk>/', views.review_verification, name='user-verify-review'),
    path('verify-requests/', views.list_verification_requests, name='user-verify-list'),
]
