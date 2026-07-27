from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User
from apps.products.models import Product, Category
from apps.orders.models import Order
from apps.content.models import HeroSettings
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import AdminCategorySerializer, AdminProductSerializer, AdminHeroSettingsSerializer


class AdminMeView(APIView):
    """Identity of the authenticated staff user; used to guard the dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        u = request.user
        return Response({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'is_staff': u.is_staff,
            'is_superuser': u.is_superuser,
        })


class AdminStatsView(APIView):
    """Overview counts for the dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            'products': Product.objects.count(),
            'categories': Category.objects.count(),
            'orders': Order.objects.count(),
            'users': User.objects.count(),
        })


class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]
    pagination_class = None


class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class AdminHeroSettingsView(APIView):
    """Read/update the singleton homepage CTA settings."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(AdminHeroSettingsSerializer(HeroSettings.load()).data)

    def patch(self, request):
        settings_obj = HeroSettings.load()
        serializer = AdminHeroSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
