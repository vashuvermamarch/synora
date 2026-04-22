from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ai_conversations, name='ai-conversations'),
    path('suggestions/', views.ai_suggestions, name='ai-suggestions'),
    path('chat/', views.ai_chat, name='ai-chat'),
    path('chat/history/', views.ai_chat_history, name='ai-chat-history'),
    path('chat/history/<int:conversation_id>/', views.ai_chat_history, name='ai-chat-history-detail'),
]
