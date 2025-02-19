import { useState, useEffect } from 'react';

const generateUserId = () => {
  return `user-${Math.random().toString(36).substr(2, 9)}`;
};

export const useAuth = () => {
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // ローカルストレージからユーザーIDを取得
    const storedId = localStorage.getItem('playerId');
    if (storedId) {
      setPlayerId(storedId);
    } else {
      // 新しいユーザーIDを生成して保存
      const newId = generateUserId();
      localStorage.setItem('playerId', newId);
      setPlayerId(newId);
    }
  }, []);

  return { playerId };
};
