from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminMeView, AdminStatsView, AdminCategoryViewSet, AdminProductViewSet

router = DefaultRouter()
router.register(r'categories', AdminCategoryViewSet, basename='admin-category')
router.register(r'products', AdminProductViewSet, basename='admin-product')

urlpatterns = [
    path('me/', AdminMeView.as_view(), name='admin-me'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('', include(router.urls)),
]
