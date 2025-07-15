export type GameMode = 'standard' | 'chess960' | 'custom';

export interface TimeControl {
  minutes: number;
  seconds: number;
  increment: number; // seconds added per move
}

export interface GameRoom {
  id: string;
  hostId: string;
  guestId?: string;
  gameMode: GameMode;
  timeControl: {
    white: TimeControl;
    black: TimeControl;
  };
  customPosition?: string; // FEN string for custom positions
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
}

export interface Player {
  id: string;
  name: string;
  color: 'white' | 'black';
  timeRemaining: number; // in seconds
}

export interface MultiplayerGameState {
  room: GameRoom;
  players: {
    white: Player;
    black: Player;
  };
  currentTurn: 'white' | 'black';
  gameStarted: boolean;
  winner?: 'white' | 'black' | 'draw';
  winReason?: 'checkmate' | 'timeout' | 'resignation' | 'draw';
} 