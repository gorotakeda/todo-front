export type GameStatus = 'WAITING' | 'SETTING_TRAP' | 'IN_PROGRESS' | 'FINISHED';

export interface User {
  id: string;
  name: string;
}

export interface GameScore {
  id: string;
  playerId: string;
  score: number;
  failures: number;
  isResetted: boolean;
}

export interface Game {
  id: string;
  player1: User;
  player2: User;
  status: GameStatus;
  currentTurn: string;
  availableSeats: number[];
  winner?: User;
  scores: GameScore[];
  trap?: { seatNumber: number };
}
