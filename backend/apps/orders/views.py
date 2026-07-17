from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, OrderCreateSerializer
from apps.products.models import Product
import uuid

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_user_cart(self, user):
        cart, created = Cart.objects.get_or_create(user=user)
        return cart

    @action(detail=False, methods=['get'])
    def list(self, request):
        cart = self.get_user_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_user_cart(request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if product.stock < quantity:
            return Response({'detail': f'Insufficient stock. Available: {product.stock}'}, status=status.HTTP_409_CONFLICT)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['put'], url_path=r'items/(?P<item_id>\d+)')
    def update_item(self, request, item_id=None):
        cart = self.get_user_cart(request.user)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        quantity = int(request.data.get('quantity', 1))
        if cart_item.product.stock < quantity:
            return Response({'detail': f'Insufficient stock. Available: {cart_item.product.stock}'}, status=status.HTTP_409_CONFLICT)

        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'], url_path=r'items/(?P<item_id>\d+)')
    def remove_item(self, request, item_id=None):
        cart = self.get_user_cart(request.user)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
        except CartItem.DoesNotExist:
            return Response({'detail': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart = self.get_user_cart(request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        cart = Cart.objects.get(user=request.user)
        if not cart.items.exists():
            return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order_number = f"ORD-{timezone.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

            # Determine payment_proof_image: only set if payment_method is 'online'
            payment_method = serializer.validated_data['payment_method']
            payment_proof_image = None
            if payment_method == 'online':
                payment_proof_image = request.FILES.get('payment_proof_image')

            order = Order.objects.create(
                user=request.user,
                order_number=order_number,
                customer_name=serializer.validated_data['customer_name'],
                customer_email=serializer.validated_data['customer_email'],
                customer_phone=serializer.validated_data.get('customer_phone', ''),
                alternative_phone=serializer.validated_data.get('alternative_phone', ''),
                shipping_address=serializer.validated_data['shipping_address'],
                city=serializer.validated_data['city'],
                postal_code=serializer.validated_data['postal_code'],
                country=serializer.validated_data['country'],
                payment_method=payment_method,
                payment_proof_image=payment_proof_image,
                notes=serializer.validated_data.get('notes', ''),
                total_amount=0,
            )

            total_amount = 0
            for cart_item in cart.items.all():
                product = cart_item.product
                product.stock -= cart_item.quantity
                product.save()

                order_item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=cart_item.quantity,
                    price_at_purchase=product.price,
                )
                total_amount += order_item.get_total_price()

            order.total_amount = total_amount
            order.save()

            cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
