import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const API_URL = 'https://todo-back-135460268268.asia-northeast1.run.app';

export const useGameSocket = (gameId: string) => {
  const socket = io(API_URL, {
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
