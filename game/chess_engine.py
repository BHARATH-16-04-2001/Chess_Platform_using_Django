import chess
import chess.engine


engine = chess.engine.SimpleEngine.popen_uci(
    "C:\\Users\\W I N N E R\\Downloads\\stockfish-windows-x86-64-avx2\\stockfish\\stockfish-windows-x86-64-avx2.exe"
)
def get_best_move(fen):
    board = chess.Board(fen)
    result = engine.play(board, chess.engine.Limit(time=0.1))
    return result.move.uci()

