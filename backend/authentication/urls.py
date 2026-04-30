from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('signup/', views.signup, name='auth-signup'),
    path('login/', views.login_view, name='auth-login'),
    path('verify-otp/', views.verify_otp_view, name='auth-verify-otp'),
    path('resend-otp/', views.resend_otp, name='auth-resend-otp'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('logout/', views.logout_view, name='auth-logout'),
    path('me/', views.me, name='auth-me'),
]
