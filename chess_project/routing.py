from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import re_path
from . import consumers

application = ProtocolTypeRouter({
    "http": URLRouter([
        # Add your HTTP URL routing here
    ]),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            # Add WebSocket routing here (for real-time chess moves)
            re_path(r'ws/chess/(?P<room_name>\w+)/$', consumers.ChessConsumer.as_asgi()),
        ])
    ),
})
