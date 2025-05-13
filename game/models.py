from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Game(models.Model):
    GAME_STATUS = [
        ('WAITING', 'Waiting for opponent'),
        ('ACTIVE', 'Game in progress'),
        ('FINISHED', 'Game finished'),
    ]

    white_player = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='white_games')
    black_player = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='black_games')
    fen = models.TextField(default="startpos")  # Standard initial FEN or board state
    status = models.CharField(max_length=10, choices=GAME_STATUS, default='WAITING')
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_games')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Game {self.id} - {self.status}"


class Move(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='moves')
    move_number = models.IntegerField()
    uci_move = models.CharField(max_length=10)  # e.g., e2e4
    played_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
