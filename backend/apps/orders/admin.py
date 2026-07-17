from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

class CartItemInline(admin.TabularInline):
    model = CartItem
    readonly_fields = ('added_at',)
    extra = 0

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'cart', 'quantity', 'added_at')
    list_filter = ('added_at', 'cart__user')
    search_fields = ('product__name', 'cart__user__username')
    readonly_fields = ('added_at',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('created_at',)
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_number', 'user__username', 'customer_email')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    fieldsets = (
        ('Order Info', {
            'fields': ('order_number', 'user', 'status')
        }),
        ('Shipping Details', {
            'fields': ('shipping_address', 'city', 'postal_code', 'country')
        }),
        ('Customer Info', {
            'fields': ('customer_email', 'customer_phone')
        }),
        ('Amount', {
            'fields': ('total_amount',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'order', 'quantity', 'price_at_purchase', 'created_at')
    list_filter = ('order__status', 'created_at')
    search_fields = ('product__name', 'order__order_number')
    readonly_fields = ('created_at',)
