from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import HeroVideo, HeroSettings
from .serializers import HeroVideoSerializer


class HeroView(APIView):
    """Public homepage hero content: CTA button + active videos."""
    permission_classes = [AllowAny]

    def get(self, request):
        settings_obj = HeroSettings.load()
        videos = HeroVideo.objects.filter(is_active=True)
        return Response({
            'cta': {
                'label': settings_obj.cta_label,
                'link': settings_obj.cta_link,
            },
            'videos': HeroVideoSerializer(videos, many=True).data,
        })
