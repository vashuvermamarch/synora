from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_session, name='session-create'),
    path('respond/<int:pk>/', views.respond_session, name='session-respond'),
    path('', views.list_sessions, name='session-list'),
    path('<int:pk>/complete/', views.complete_session, name='session-complete'),
    path('request/', views.create_swap_request, name='swap-request-create'),
    path('requests/', views.list_swap_requests, name='swap-request-list'),
    path('requests/respond/<int:pk>/', views.respond_swap_request, name='swap-request-respond'),
    path('rating/', views.submit_rating, name='session-rating'),
    path('room/<str:room_name>/', views.get_session_by_room, name='session-by-room'),
]
