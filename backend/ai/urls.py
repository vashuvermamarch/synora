from django.urls import path
from . import views

urlpatterns = [
    path('suggestions/', views.ai_suggestions, name='ai-suggestions'),
    path('chat/', views.ai_chat, name='ai-chat'),
]
