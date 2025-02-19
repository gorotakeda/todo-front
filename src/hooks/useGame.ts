import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Game } from '../types/game';

const API_URL = 'http://localhost:8000';

export const useGame = (gameId: string, playerId: string) => {
  const [gameState, setGameState] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket']
    });

    const fetchGameState = async () => {
      try {
        const response = await fetch(`${API_URL}/games/${gameId}`);
        if (!response.ok) throw new Error('ゲームの取得に失敗しました');
        const data = await response.json();
        setGameState(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }
    };

    socket.on('connect', () => {
      console.log('Connected to WebSocket', socket.id);
      socket.emit('joinGame', gameId);
    });

    socket.on('gameUpdate', (updatedGame: Game) => {
      console.log('Game updated:', updatedGame);
      setGameState(updatedGame);
    });

    void fetchGameState();

    return () => {
      socket.off('gameUpdate');
      socket.off('connect');
      socket.emit('leaveGame', gameId);
      socket.disconnect();
    };
  }, [gameId]);

  const setTrap = useCallback(async (seatNumber: number) => {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/trap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, seatNumber }),
      });
      if (!response.ok) throw new Error('トラップの設置に失敗しました');
      const data = await response.json();
      setGameState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  }, [gameId, playerId]);

  const selectSeat = useCallback(async (seatNumber: number) => {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, seatNumber }),
      });
      if (!response.ok) throw new Error('座席の選択に失敗しました');
      const data = await response.json();
      setGameState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  }, [gameId, playerId]);

  const joinGame = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      if (!response.ok) throw new Error('ゲームへの参加に失敗しました');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  }, [gameId, playerId]);

  return { gameState, error, setTrap, selectSeat, joinGame };
};
