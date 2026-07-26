from rest_framework import serializers
from apps.products.models import Category
from .utils import unique_slug


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']

    def create(self, validated_data):
        validated_data['slug'] = unique_slug(Category, validated_data['name'])
        return super().create(validated_data)
