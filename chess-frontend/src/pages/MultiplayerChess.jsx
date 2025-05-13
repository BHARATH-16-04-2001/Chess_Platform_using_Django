import React, { useEffect, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const MultiplayerChess = () => {
  const [game, setGame] = useState(new Chess());
  const socketRef = useRef(null);

  useEffect(() => {
    // Establish WebSocket connection
    socketRef.current = new WebSocket('ws://localhost:8000/ws/chess/room1/');

    // Receive moves from opponent
    socketRef.current.onmessage = (event) => {
      const move = JSON.parse(event.data);
      const tempGame = new Chess(game.fen());
      tempGame.move(move);
      setGame(tempGame);
    };

    // Clean up on unmount
    return () => {
      socketRef.current.close();
    };
  }, []); // Run only once on mount

  const makeMove = (move) => {
    const tempGame = new Chess(game.fen());
    const result = tempGame.move(move);
    if (result) {
      setGame(tempGame);
      socketRef.current.send(JSON.stringify(move)); // Send move to opponent
      return true;
    }
    return false;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <Chessboard
        position={game.fen()}
        onPieceDrop={(source, target) => makeMove({ from: source, to: target })}
        boardWidth={500}
      />
    </div>
  );
};

export default MultiplayerChess;
