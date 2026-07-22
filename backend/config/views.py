from django.http import JsonResponse, FileResponse
from django.views.decorators.http import require_http_methods
from django.conf import settings
from pathlib import Path

def api_root(request):
    """API root endpoint - returns available API endpoints"""
    return JsonResponse({
        'message': 'LEGALIZE DREAMS API',
        'version': '1.0',
        'status': 'online',
        'endpoints': {
            'admin': '/admin/',
            'auth': '/api/auth/',
            'products': '/api/products/',
            'categories': '/api/categories/',
            'orders': '/api/orders/',
            'cart': '/api/cart/',
        }
    })

@require_http_methods(["GET"])
def serve_react(request):
    """Serve React app index.html for all non-API routes"""
    # In production, collectstatic moves files to STATIC_ROOT (staticfiles/)
    # In development, they stay in STATICFILES_DIRS (static/)
    index_path = Path(settings.STATIC_ROOT) / 'index.html'
    if not index_path.exists():
        # Fallback to dev location
        index_path = Path(settings.BASE_DIR) / 'static' / 'index.html'

    if index_path.exists():
        return FileResponse(open(index_path, 'rb'), content_type='text/html')
    # Fallback: return simple HTML if index.html not found
    return JsonResponse({'error': 'React app not built yet'}, status=404)
