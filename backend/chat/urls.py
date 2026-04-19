from django.urls import path
from . import views

urlpatterns = [
    path('messages/', views.messages, name='chat-messages'),
    path('messages/<int:user_id>/', views.conversation, name='chat-conversation'),
]
