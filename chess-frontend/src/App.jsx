import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChessVsAI from './pages/ChessVsAI';
import MultiplayerChess from './pages/MultiplayerChess';

const Home = () => {
  return (
    <div className="main-container">
      <h1>Welcome to Chess</h1>
      <div className="buttons-container">
        <Link to="/chessvsai">
          <button>Play with AI</button>
        </Link>
        <Link to="/multiplayer">
          <button>Player vs Player</button>
        </Link>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chessvsai" element={<ChessVsAI />} />
        <Route path="/multiplayer" element={<MultiplayerChess />} />
      </Routes>
    </Router>
  );
};

export default App;

