from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class SafeJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that gracefully handles invalid tokens.

    Instead of raising an error for invalid tokens, it returns None,
    allowing the request to proceed unauthenticated. This enables
    endpoints with AllowAny() permissions to work even if an invalid
    token is present in the Authorization header.
    """

    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed:
            # Return None to indicate no authentication
            # This allows AllowAny endpoints to proceed
            return None
