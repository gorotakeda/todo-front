import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { GameBoard } from './components/GameBoard';
import './App.css';
import { Home } from './components/Home';
import { useGame } from './hooks/useGame';
import { useAuth } from './hooks/useAuth';
const GameBoardWrapper = () => {
  const { gameId } = useParams();
  const { playerId } = useAuth();
  useGame(gameId ?? '', playerId ?? '');

  if (!gameId || !playerId) return null;

  return <GameBoard gameId={gameId} playerId={playerId} />;
};

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:gameId" element={<GameBoardWrapper />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
