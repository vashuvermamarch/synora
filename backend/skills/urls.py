from django.urls import path
from . import views

urlpatterns = [
    path('', views.skill_list, name='skill-list'),
    path('match/', views.match_users, name='skill-match'),
]
