# """
# ASGI config for chess_project project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
# """

# import os
# import django
# from django.core.asgi import get_asgi_application

# from channels.routing import get_default_application
# from game.routing import websocket_urlpatterns

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chess_project.settings')
# django.setup()
# application = get_asgi_application()


# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# import game.routing

# application = ProtocolTypeRouter({
#     "websocket": AuthMiddlewareStack(
#         URLRouter(
#             game.routing.websocket_urlpatterns
#         )
#     ),
# })

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AuthMiddlewareStack(
#         URLRouter(websocket_urlpatterns)
#     ),
# })


import os
import django
from django.core.asgi import get_asgi_application

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import game.routing  # Import your routing module for WebSocket

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chess_project.settings')
django.setup()

# The application is created using ProtocolTypeRouter to handle HTTP and WebSocket requests
application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # This handles standard HTTP traffic, routed via Django views
    "websocket": AuthMiddlewareStack(  # This handles WebSocket connections
        URLRouter(
            game.routing.websocket_urlpatterns  # Define WebSocket routes here
        )
    ),
})
