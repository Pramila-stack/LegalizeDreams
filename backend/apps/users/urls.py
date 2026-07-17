from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import AuthViewSet

urlpatterns = [
    path('register/', AuthViewSet.as_view({'post': 'register'}), name='register'),
    path('login/', AuthViewSet.as_view({'post': 'login'}), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', AuthViewSet.as_view({'get': 'profile', 'put': 'profile_update'}), name='profile'),
]
