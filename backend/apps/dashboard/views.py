from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User
from apps.products.models import Product, Category
from apps.orders.models import Order


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
