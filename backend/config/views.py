from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

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
    """Serve React app for all non-API routes"""
    return render(request, 'index.html')
