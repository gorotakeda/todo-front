import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const useGameSocket = (gameId: string) => {
  const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket']
  });

  useEffect(() => {
    socket.emit('joinGame', gameId);

    socket.on('gameUpdate', (gameData) => {
      // ゲームの状態を更新する処理
      console.log('Game updated:', gameData);
    });

    return () => {
      socket.emit('leaveGame', gameId);
      socket.disconnect();
    };
  }, [gameId]);

  const sendMove = useCallback((move: any) => {
    socket.emit('makeMove', { gameId, ...move });
  }, [gameId, socket]);

  return { sendMove };
};
