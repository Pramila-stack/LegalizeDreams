from rest_framework import serializers
from .models import HeroVideo


class HeroVideoSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = HeroVideo
        fields = ['id', 'title', 'src']

    def get_src(self, obj):
        return obj.video.url if obj.video else None
