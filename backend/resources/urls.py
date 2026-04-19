from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_resource, name='resource-create'),
    path('list/', views.list_resources, name='resource-list'),
    path('<int:pk>/', views.resource_detail, name='resource-detail'),
]
