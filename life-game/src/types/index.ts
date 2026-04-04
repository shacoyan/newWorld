// サーバー側の定義に準拠した基本型

export type Severity = 'light' | 'medium' | 'heavy' | 'none';

export interface DrinkEvent {
  title: string;
  description: string;
  severity: Severity;
}

export type SquareType = 'start' | 'goal' | 'drink-self' | 'drink-target' | 'drink-all' | 'challenge' | 'lucky' | 'special';

export interface BoardSquare {
  id: number;
  type: SquareType;
  event: DrinkEvent;
}

export interface GameState {
  currentPlayerIndex: number;
  board: BoardSquare[];
  turnCount: number;
}

export interface Player {
  id: string;
  socketId: string;
  name: string;
  position: number;
  color: string;
  isFinished: boolean;
  finishOrder?: number;
}

export interface Room {
  id: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  hostId: string;
  gameState?: GameState;
}

// フロントエンドローカルUI状態
export type GamePhase = 'waiting' | 'rolling' | 'moving' | 'event' | 'finished';

export interface SpinResult {
  player: Player;
  steps: number;
  landed: BoardSquare;
  isFinished: boolean;
}
