import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';

const getPieceName = (piece) => {
  switch (piece) {
    case 'p': return 'Pawn';
    case 'n': return 'Knight';
    case 'b': return 'Bishop';
    case 'r': return 'Rook';
    case 'q': return 'Queen';
    case 'k': return 'King';
    default: return '';
  }
};

const ChessVsAI = () => {
  const [game, setGame] = useState(new Chess());
  const [squareStyles, setSquareStyles] = useState({});
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [mode, setMode] = useState("drag");
  const [moveHistory, setMoveHistory] = useState([]);
  const [orientation, setOrientation] = useState("white");
  const [showSettings, setShowSettings] = useState(false);
  const [boardSize, setBoardSize] = useState(500);

  const [statusMessage, setStatusMessage] = useState('');


  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 500) setBoardSize(width - 40);
      else if (width < 768) setBoardSize(400);
      else setBoardSize(500);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // const makeAMove = async (move) => {
  //   const tempGame = new Chess(game.fen());
  //   const result = tempGame.move(move);
  //   if (!result) return false;

  //   const from = result.from;
  //   const to = result.to;
  //   const piece = getPieceName(result.piece);
  //   const isCapture = result.flags.includes('c') ? ' (capture)' : '';
  //   const playerMoveDesc = `You - ${piece}: ${from} → ${to}${isCapture}`;

  //   setMoveHistory(prev => [...prev, { move: playerMoveDesc, moveData: { from, to } }]);
  //   setGame(new Chess(tempGame.fen()));
  //   setSquareStyles({});
  //   setSelectedSquare(null);

  //   try {
  //     const res = await axios.post('http://localhost:8000/api/ai-move/', {
  //       fen: tempGame.fen(),
  //     });

  //     const aiMove = res.data.move;
  //     const updatedGame = new Chess(tempGame.fen());
  //     const aiResult = updatedGame.move({
  //       from: aiMove.slice(0, 2),
  //       to: aiMove.slice(2, 4),
  //     });

  //     const aiPiece = getPieceName(aiResult.piece);
  //     const aiCapture = aiResult.flags.includes('c') ? ' (capture)' : '';
  //     const aiMoveDesc = `AI - ${aiPiece}: ${aiResult.from} → ${aiResult.to}${aiCapture}`;

  //     setMoveHistory(prev => [...prev, { move: aiMoveDesc, moveData: { from: aiResult.from, to: aiResult.to } }]);
  //     setGame(updatedGame);
  //   } catch (err) {
  //     console.error('AI move failed:', err);
  //   }

  //   return true;
  // };

  const makeAMove = async (move) => {
  if (game.isGameOver()) {
    setStatusMessage("Game over.");
    return false;
  }

  const tempGame = new Chess(game.fen());
  const result = tempGame.move(move);
  if (!result) return false;

  const from = result.from;
  const to = result.to;
  const piece = getPieceName(result.piece);
  const isCapture = result.flags.includes('c') ? ' (capture)' : '';
  const playerMoveDesc = `You - ${piece}: ${from} → ${to}${isCapture}`;

  setMoveHistory(prev => [...prev, { move: playerMoveDesc, moveData: { from, to } }]);
  setGame(new Chess(tempGame.fen()));
  setSquareStyles({});
  setSelectedSquare(null);

  if (tempGame.isCheckmate()) {
    setStatusMessage("Checkmate! You win 🎉");
    return true;
  } else if (tempGame.isCheck()) {
    setStatusMessage("Check to AI ♟️");
  } else {
    setStatusMessage('');
  }

  try {
    const res = await axios.post('http://localhost:8000/api/ai-move/', {
      fen: tempGame.fen(),
    });

    if (!res.data || !res.data.move) {
      console.error("Invalid response from AI backend:", res.data);
      setStatusMessage("AI move failed (no move returned).");
      return true;
    }

    const aiMove = res.data.move;
    const updatedGame = new Chess(tempGame.fen());
    const aiResult = updatedGame.move({
      from: aiMove.slice(0, 2),
      to: aiMove.slice(2, 4),
    });

    if (!aiResult) {
      console.error("Invalid AI move attempted:", aiMove);
      setStatusMessage("AI made an invalid move.");
      return true;
    }

    const aiPiece = getPieceName(aiResult.piece);
    const aiCapture = aiResult.flags.includes('c') ? ' (capture)' : '';
    const aiMoveDesc = `AI - ${aiPiece}: ${aiResult.from} → ${aiResult.to}${aiCapture}`;

    setMoveHistory(prev => [...prev, { move: aiMoveDesc, moveData: { from: aiResult.from, to: aiResult.to } }]);
    setGame(updatedGame);

    if (updatedGame.isCheckmate()) {
      setStatusMessage("Checkmate! AI wins 🧠");
    } else if (updatedGame.isCheck()) {
      setStatusMessage("Check to You ⚠️");
    } else if (updatedGame.isDraw()) {
      setStatusMessage("Game drawn 🤝");
    } else {
      setStatusMessage('');
    }

  } catch (err) {
    console.error('AI move failed:', err);
    setStatusMessage("Failed to fetch AI move.");
  }

  return true;
};


  const handleTapMove = (square) => {
    if (selectedSquare) {
      makeAMove({ from: selectedSquare, to: square });
      setSelectedSquare(null);
      setSquareStyles({});
      return;
    }

    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) {
      setSquareStyles({ [square]: { backgroundColor: 'rgba(255, 0, 0, 0.6)' } });
      return;
    }

    const highlights = {};
    moves.forEach((move) => {
      highlights[move.to] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' };
    });
    highlights[square] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };

    setSquareStyles(highlights);
    setSelectedSquare(square);
  };

  const onSquareClick = (square) => {
    if (mode === "tap" || mode === "both") handleTapMove(square);
  };

  const onPieceDrop = (source, target) => {
    if (mode === "drag" || mode === "both") return makeAMove({ from: source, to: target });
    return false;
  };

  const handleUndo = () => {
    if (moveHistory.length > 0) {
      const newHistory = [...moveHistory];
      newHistory.pop(); // AI move
      newHistory.pop(); // Player move

      const previousGame = new Chess();
      newHistory.forEach((move) => {
        previousGame.move(move.moveData);
      });

      setMoveHistory(newHistory);
      setGame(previousGame);
    }
  };

  const handleRestart = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setSquareStyles({});
    setSelectedSquare(null);
  };

  const handleSwapBoard = () => {
    setOrientation(prev => (prev === "white" ? "black" : "white"));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>♟️ Play Against AI</h1>
      {statusMessage && <div style={styles.statusMessage}>{statusMessage}</div>}


      <div style={styles.settingsIcon}>
        <button style={styles.iconButton} onClick={() => setShowSettings(!showSettings)}>⚙️</button>
      </div>

      {showSettings && (
        <div style={styles.settingsPanel}>
          <p style={{ marginBottom: 10, fontWeight: 'bold' }}>Interaction Mode</p>
          <div style={styles.settingsButtons}>
            <button
              style={mode === "drag" ? styles.activeButton : styles.button}
              onClick={() => setMode("drag")}
            >Drag</button>
            <button
              style={mode === "tap" ? styles.activeButton : styles.button}
              onClick={() => setMode("tap")}
            >Tap</button>
            <button
              style={mode === "both" ? styles.activeButton : styles.button}
              onClick={() => setMode("both")}
            >Both</button>
          </div>
        </div>
      )}
   
      <div style={styles.boardWrapper}>
        <Chessboard
          position={game.fen()}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          customSquareStyles={squareStyles}
          boardWidth={boardSize}
          boardOrientation={orientation}
        />
      </div>
      

      <div style={styles.controls}>
        <button style={styles.button} onClick={handleRestart}>🔄 Restart</button>
        <button style={styles.button} onClick={handleUndo} disabled={moveHistory.length < 2}>↩️ Undo</button>
        <button style={styles.button}  onClick={handleSwapBoard}>🔁 Swap</button>
      </div>

      <div style={styles.history}>
        <h2>Move History</h2>
        <ol>
          {moveHistory.map((move, index) => (
            <li key={index}>{move.move}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '100%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '10px',
    textAlign: 'center',
  },
  boardWrapper: {
    display: 'flex',
    justifyContent: 'center',

    width: '100%',
    margin: '20px 0',
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  iconButton: {
    fontSize: '24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  settingsPanel: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'grey',
    border: '1px solid #ccc',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  settingsButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  button: {
    padding: '10px 16px',
    backgroundColor: '#4A90E2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  activeButton: {
    padding: '10px 16px',
    backgroundColor: '#2C7BE5',
    color: '#fff',
    border: '2px solid #174EA6',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  controls: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  history: {
    maxWidth: '90vw',
    textAlign: 'left',
    padding: '10px',
    borderTop: '1px solid #ccc',
  },

  statusMessage: {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#c0392b',
  marginBottom: '10px',
},

};

export default ChessVsAI;
