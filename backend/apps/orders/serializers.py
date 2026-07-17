from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from apps.products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price']

    def get_total_price(self, obj):
        return str(obj.get_total_price())

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items']

    def get_total_price(self, obj):
        return str(obj.get_total_price())

    def get_total_items(self, obj):
        return obj.get_total_items()

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price_at_purchase', 'total_price']

    def get_total_price(self, obj):
        return str(obj.get_total_price())

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'total_amount', 'items',
                  'shipping_address', 'city', 'postal_code', 'country',
                  'customer_email', 'customer_phone', 'notes', 'created_at']
        read_only_fields = ['order_number', 'created_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['customer_name', 'customer_email', 'customer_phone', 'alternative_phone',
                  'shipping_address', 'city', 'postal_code', 'country',
                  'payment_method', 'payment_proof_image']

    def validate_customer_name(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters")
        return value

    def validate_customer_phone(self, value):
        # Extract only digits from the phone number
        digits_only = ''.join(filter(str.isdigit, value))
        if len(digits_only) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits")
        return value
