from rest_framework import serializers
from apps.products.models import Category, Product
from .utils import unique_slug


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']

    def create(self, validated_data):
        validated_data['slug'] = unique_slug(Category, validated_data['name'])
        return super().create(validated_data)


class AdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'category',
                  'category_name', 'stock', 'image', 'rating', 'review_count',
                  'is_active', 'created_at']
        read_only_fields = ['id', 'slug', 'rating', 'review_count', 'created_at']

    def validate(self, attrs):
        if self.instance is None and not attrs.get('image'):
            raise serializers.ValidationError({'image': 'An image is required when creating a product.'})
        return attrs

    def create(self, validated_data):
        validated_data['slug'] = unique_slug(Product, validated_data['name'])
        return super().create(validated_data)
