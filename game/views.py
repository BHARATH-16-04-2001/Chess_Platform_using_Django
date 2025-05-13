from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import Game, Move
from .serializers import GameSerializer, MoveSerializer

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from .chess_engine import get_best_move

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

import logging

# @method_decorator(csrf_exempt, name='dispatch')
# class AIMoveView(APIView):
#     def post(self, request):
#         fen = request.data.get("fen")
#         move = get_best_move(fen)
#         return Response({"move": move})




logger = logging.getLogger(__name__)

class AIMoveView(APIView):
    def post(self, request):
        fen = request.data.get("fen")
        logger.info(f"Received FEN: {fen}")
        move = get_best_move(fen)
        logger.info(f"AI Move: {move}")
        return Response({"move": move})






class CreateGameView(APIView):
    def post(self, request):
        user = request.user
        game = Game.objects.create(white_player=user)
        return Response(GameSerializer(game).data)

class JoinGameView(APIView):
    def post(self, request, game_id):
        user = request.user
        try:
            game = Game.objects.get(id=game_id)
            if not game.black_player:
                game.black_player = user
                game.status = "ACTIVE"
                game.save()
                return Response(GameSerializer(game).data)
            else:
                return Response({"error": "Game already has two players."}, status=400)
        except Game.DoesNotExist:
            return Response({"error": "Game not found."}, status=404)

class GameDetailView(APIView):
    def get(self, request, game_id):
        try:
            game = Game.objects.get(id=game_id)
            return Response(GameSerializer(game).data)
        except Game.DoesNotExist:
            return Response({"error": "Game not found."}, status=404)

class MakeMoveView(APIView):
    def post(self, request, game_id):
        uci_move = request.data.get("uci_move")
        move_number = request.data.get("move_number")
        user = request.user

        try:
            game = Game.objects.get(id=game_id)
            Move.objects.create(game=game, uci_move=uci_move, move_number=move_number, played_by=user)
            # Update FEN externally or from frontend (for simplicity here)
            game.fen = request.data.get("fen")
            game.save()
            return Response({"message": "Move recorded."})
        except Game.DoesNotExist:
            return Response({"error": "Game not found."}, status=404)
