import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, Text, VStack, HStack, useToast } from '@chakra-ui/react';
import { useGame } from '../hooks/useGame';

interface GameBoardProps {
  gameId: string;
  playerId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameId, playerId }) => {
  const { gameState, error, setTrap, selectSeat } = useGame(gameId, playerId);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [showTrapAnimation, setShowTrapAnimation] = useState(false);
  const [lastResetState, setLastResetState] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    if (gameState?.scores) {
      const currentPlayerScore = gameState.scores.find(s => s.playerId === playerId);
      if (currentPlayerScore?.isResetted && !lastResetState) {
        setShowTrapAnimation(true);
        toast({
          title: "💣 トラップ発動！",
          description: "得点がリセットされました！",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        setTimeout(() => {
          setShowTrapAnimation(false);
          setLastResetState(true);
        }, 1500);
      } else if (!currentPlayerScore?.isResetted) {
        setLastResetState(false);
      }
    }
  }, [gameState?.scores, playerId, lastResetState]);

  if (!gameState || !gameState.scores) {
    return <Box>ゲームをロード中...</Box>;
  }

  const isMyTurn = gameState.currentTurn === playerId;
  const playerScore = gameState.scores.find(s => s.playerId === playerId);
  const opponentScore = gameState.scores.find(s => s.playerId !== playerId);
  const isFirstPlayer = gameState.player1.id === playerId;

  const handleSeatClick = async (seatNumber: number) => {
    if (!isMyTurn) return;

    setSelectedSeat(seatNumber);

    const message = gameState.status === 'SETTING_TRAP'
      ? `${seatNumber}番の席にトラップを仕掛けますか？`
      : `${seatNumber}番の席を選択しますか？`;

    const isConfirmed = window.confirm(message);

    if (!isConfirmed) {
      setSelectedSeat(null);
      return;
    }

    if (gameState.status === 'SETTING_TRAP') {
      setTrap(seatNumber);
    } else if (gameState.status === 'IN_PROGRESS') {
      selectSeat(seatNumber);
    }
  };

  const getGameStateMessage = () => {
    if (!isMyTurn) {
      return '相手のターンです';
    }
    switch (gameState.status) {
      case 'SETTING_TRAP':
        return 'トラップを設置してください';
      case 'IN_PROGRESS':
        return '席を選んでください';
      default:
        return '';
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {showTrapAnimation && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255, 0, 0, 0.3)"
          zIndex={999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          animation="shake 0.5s"
        >
          <Text
            fontSize="6xl"
            color="red.500"
            fontWeight="bold"
            textShadow="2px 2px 4px rgba(0,0,0,0.5)"
          >
            💣 トラップ発動！
          </Text>
        </Box>
      )}

      <Box p={6}>
        <VStack gap={6}>
          <Text fontSize="lg" color="blue.600">
            あなたは{isFirstPlayer ? 'プレイヤー1（先攻）' : 'プレイヤー2（後攻）'}です
          </Text>

          <HStack justify="space-between" w="100%">
            <Box>
              <Text>あなたのスコア: {playerScore?.score ?? 0}</Text>
              <Text>失敗回数: {playerScore?.failures ?? 0}</Text>
            </Box>
            <Box>
              <Text>相手のスコア: {opponentScore?.score ?? 0}</Text>
              <Text>失敗回数: {opponentScore?.failures ?? 0}</Text>
            </Box>
          </HStack>

          <Text fontSize="xl" color={isMyTurn ? 'green.500' : 'red.500'}>
            {getGameStateMessage()}
          </Text>

          <Box position="relative" w="300px" h="300px" margin="0 auto">
            {gameState.availableSeats
              .map((seat, i) => ({ seat, originalIndex: i }))
              .sort((a, b) => {
                // 12を最初に持ってくる
                if (a.seat === 12) return -1;
                if (b.seat === 12) return 1;
                return a.seat - b.seat;
              })
              .map(({ seat }, index) => {
                const angle = (index * (360 / gameState.availableSeats.length)) - 90; // -90度で12時の位置から開始
                const radius = 120; // 円の半径（px）
                const x = radius * Math.cos((angle * Math.PI) / 180);
                const y = radius * Math.sin((angle * Math.PI) / 180);

                return (
                  <Button
                    key={seat}
                    size="lg"
                    onClick={() => handleSeatClick(seat)}
                    disabled={!isMyTurn}
                    borderRadius="full"
                    position="absolute"
                    transform={`translate(${x}px, ${y}px)`}
                    left="50%"
                    top="50%"
                    width="60px"
                    height="60px"
                  >
                    {seat}
                  </Button>
                );
              })}
          </Box>

          {gameState.status === 'FINISHED' && (
            <Text fontSize="2xl" fontWeight="bold">
              {gameState.winner?.id === playerId ? '勝利！' : '敗北...'}
            </Text>
          )}

          {error && (
            <Text color="red.500">
              エラーが発生しました: {error}
            </Text>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

// CSSアニメーションの定義
const styles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;

// スタイルをヘッドに追加
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
