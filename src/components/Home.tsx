import React, { useState } from 'react';
import { Box, VStack, Button, Text, useToast, Select, Input } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const API_URL = 'http://localhost:8000';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { playerId } = useAuth();
  const [opponent, setOpponent] = useState('cpu');
  const [gameId, setGameId] = useState('');

  const handleCreateGame = async () => {
    if (!playerId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1Id: playerId,
          gameMode: opponent,
          availableSeats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        }),
      });

      if (!response.ok) {
        throw new Error('ゲームの作成に失敗しました');
      }

      const game = await response.json();
      navigate(`/game/${game.id}`);
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'ゲームの作成に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerId || !gameId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        throw new Error('ゲームの参加に失敗しました');
      }

      navigate(`/game/${gameId}`);
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'ゲームの参加に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={6}>
      <VStack gap={6}>
        <Text fontSize="2xl">席取り合戦</Text>
        <Select
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          width="200px"
        >
          <option value="cpu">CPU対戦</option>
          <option value="friend">フレンド対戦</option>
        </Select>
        <Button
          onClick={handleCreateGame}
          isLoading={isLoading}
          loadingText="作成中..."
          isDisabled={!playerId}
        >
          新しいゲームを作成
        </Button>

        <Text>または</Text>

        <Input
          placeholder="ゲームIDを入力"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        />
        <Button
          colorScheme="green"
          onClick={handleJoinGame}
          isLoading={isLoading}
          isDisabled={!gameId}
        >
          ゲームに参加
        </Button>
      </VStack>
    </Box>
  );
};
