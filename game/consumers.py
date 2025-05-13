# from channels.generic.websocket import AsyncWebsocketConsumer
# import json

# class ChessConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['room_name']
#         self.room_group_name = f'chess_{self.room_name}'

#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

#     async def receive(self, text_data):
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'move_message',
#                 'message': text_data
#             }
#         )

#     async def move_message(self, event):
#         await self.send(text_data=event['message'])




# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChessGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "chess_game"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        move = text_data_json['move']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chess_move',
                'move': move
            }
        )

    # Receive message from room group
    async def chess_move(self, event):
        move = event['move']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'move': move
        }))
