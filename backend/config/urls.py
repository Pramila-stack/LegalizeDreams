from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from config.views import api_root, serve_react

urlpatterns = [
    path('api/', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.orders.urls')),

    # Serve React app for all other routes (catch-all must be last)
    # Exclude: api, admin, static, media, assets (static file assets from React build)
    re_path(r'^(?!api|admin|static|media|assets).*', serve_react, name='react-app'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
