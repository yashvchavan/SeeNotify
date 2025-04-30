from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('classify/', views.classify_notification, name='classify-list'),
    path('classify', views.classify_notification, name='classify-list'),
]