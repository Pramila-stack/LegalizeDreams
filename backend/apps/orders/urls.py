from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('cart/', CartViewSet.as_view({'get': 'list'}), name='cart'),
    path('cart/add-item/', CartViewSet.as_view({'post': 'add_item'}), name='cart_add_item'),
    path('cart/items/<int:item_id>/', CartViewSet.as_view({
        'put': 'update_item',
        'delete': 'remove_item'
    }), name='cart_item'),
    path('cart/clear/', CartViewSet.as_view({'delete': 'clear'}), name='cart_clear'),
    path('orders/create/', OrderViewSet.as_view({'post': 'create_order'}), name='create_order'),
    path('', include(router.urls)),
]
