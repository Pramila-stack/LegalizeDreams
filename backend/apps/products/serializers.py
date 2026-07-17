from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'stock', 'rating', 'review_count',
                  'image', 'category', 'category_name', 'is_active', 'created_at']
        read_only_fields = ['rating', 'review_count', 'slug', 'created_at']

class ProductDetailSerializer(ProductSerializer):
    category = CategorySerializer(read_only=True)

    class Meta(ProductSerializer.Meta):
        pass
