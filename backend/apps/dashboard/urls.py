from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminMeView, AdminStatsView, AdminCategoryViewSet, AdminProductViewSet, AdminHeroSettingsView, AdminHeroVideoViewSet

router = DefaultRouter()
router.register(r'categories', AdminCategoryViewSet, basename='admin-category')
router.register(r'products', AdminProductViewSet, basename='admin-product')
router.register(r'hero-videos', AdminHeroVideoViewSet, basename='admin-hero-video')

urlpatterns = [
    path('me/', AdminMeView.as_view(), name='admin-me'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('hero-settings/', AdminHeroSettingsView.as_view(), name='admin-hero-settings'),
    path('', include(router.urls)),
]
