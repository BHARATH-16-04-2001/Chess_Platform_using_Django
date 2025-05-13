from django.urls import re_path,path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chess/(?P<room_name>\w+)/$', consumers.ChessConsumer.as_asgi()),
    path('ws/chess_game/', consumers.ChessGameConsumer.as_asgi()),
     
]



