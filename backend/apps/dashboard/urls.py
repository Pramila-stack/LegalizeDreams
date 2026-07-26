from django.urls import path
from .views import AdminMeView, AdminStatsView

urlpatterns = [
    path('me/', AdminMeView.as_view(), name='admin-me'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
]
