from django.urls import path
from .views import AIMoveView
from .views import CreateGameView, JoinGameView, GameDetailView, MakeMoveView


urlpatterns = [
    path('ai-move/', AIMoveView.as_view(), name='ai-move'),

    path('create/', CreateGameView.as_view(), name='create-game'),
    path('<int:game_id>/join/', JoinGameView.as_view(), name='join-game'),
    path('<int:game_id>/', GameDetailView.as_view(), name='game-detail'),
    path('<int:game_id>/move/', MakeMoveView.as_view(), name='make-move'),
]



