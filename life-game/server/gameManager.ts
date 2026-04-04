import { Room, Player, GameState, BoardSquare, DrinkEvent } from './roomManager';

const BOARD_SIZE = 30;
const GOAL_POSITION = 29;
const MAX_STEPS = 6;
const MIN_STEPS = 1;

const DRINK_SELF_EVENTS: DrinkEvent[] = [
  { title: '一口飲む', description: '軽く一口、チーズ！', severity: 'light' },
  { title: '二口飲む', description: '二口でいっとこう！', severity: 'light' },
  { title: '三口飲む', description: '三口ガッツリいこう！', severity: 'medium' },
  { title: '一気飲み！', description: '一気でイッキ！', severity: 'heavy' },
  { title: '半分飲む', description: 'グラスの半分まで飲もう！', severity: 'medium' }
];

const DRINK_TARGET_EVENTS: DrinkEvent[] = [
  { title: '指名して一口', description: '誰か一人を指名して一口飲ませる', severity: 'light' },
  { title: '右隣と乾杯', description: '右隣の人と乾杯して飲もう！', severity: 'light' },
  { title: '左隣に一口', description: '左隣の人に一口飲ませよう！', severity: 'light' },
  { title: '指名して一気', description: '好きな人を指名して一気飲み！', severity: 'heavy' },
  { title: '一番近い人と乾杯', description: '一番近いプレイヤーと乾杯して一口！', severity: 'light' }
];

const DRINK_ALL_EVENTS: DrinkEvent[] = [
  { title: '全員で乾杯！', description: '全員で乾杯して一口ずつ！', severity: 'light' },
  { title: '全員一気飲み！', description: '全員で一気飲み！覚悟はいいか？', severity: 'heavy' },
  { title: '全員で半分飲む', description: '全員グラスの半分まで飲もう！', severity: 'medium' }
];

const CHALLENGE_EVENTS: DrinkEvent[] = [
  { title: '早飲み対決！', description: '負けた方が追加で一口！', severity: 'medium' },
  { title: 'じゃんけん！', description: '負けたら一気飲み！', severity: 'heavy' },
  { title: 'NGワードゲーム', description: 'NGワードを言ったら一口！', severity: 'medium' },
  { title: '一発ギャグ！', description: 'スベったら一気飲み！ウケたらセーフ', severity: 'medium' },
  { title: 'しりとり5個', description: '30秒以内にしりとり5個！失敗したら一気', severity: 'medium' }
];

const LUCKY_EVENTS: DrinkEvent[] = [
  { title: 'セーフ！', description: '飲まなくてOK！ラッキー！', severity: 'none' },
  { title: 'ラッキー！', description: '誰かに一口飲ませる権利GET！', severity: 'none' },
  { title: 'パス！', description: '今回はパス！お休み！', severity: 'none' },
  { title: '天使降臨！', description: '次のイベントも免除！', severity: 'none' }
];

const SPECIAL_EVENTS: DrinkEvent[] = [
  { title: 'リバース！', description: 'ターン順が逆転する！', severity: 'none' },
  { title: 'ワープ！3マス進む', description: '3マス前進！', severity: 'none' },
  { title: '落とし穴！3マス戻る', description: '3マス後退！油断大敵！', severity: 'none' },
  { title: '透明化！', description: '次のイベントスキップ！', severity: 'none' },
  { title: '二度振り！', description: 'もう一回サイコロを振れる！', severity: 'none' }
];

type EventType = 'drink-self' | 'drink-target' | 'drink-all' | 'challenge' | 'lucky' | 'special';

const EVENT_TYPE_MAP: Record<EventType, DrinkEvent[]> = {
  'drink-self': DRINK_SELF_EVENTS,
  'drink-target': DRINK_TARGET_EVENTS,
  'drink-all': DRINK_ALL_EVENTS,
  'challenge': CHALLENGE_EVENTS,
  'lucky': LUCKY_EVENTS,
  'special': SPECIAL_EVENTS
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateBoard(): BoardSquare[] {
  const board: BoardSquare[] = [];

  board.push({
    id: 0,
    type: 'start',
    event: { title: 'スタート', description: 'ライフゲームスタート！', severity: 'none' }
  });

  const middleSquares: EventType[] = [];
  const typeWeights: [EventType, number][] = [
    ['drink-self', 7],
    ['drink-target', 5],
    ['drink-all', 3],
    ['challenge', 4],
    ['lucky', 3],
    ['special', 4]
  ];

  for (const [type, weight] of typeWeights) {
    for (let i = 0; i < weight; i++) {
      middleSquares.push(type);
    }
  }

  const shuffledTypes = shuffleArray(middleSquares).slice(0, BOARD_SIZE - 2);

  for (let i = 0; i < shuffledTypes.length; i++) {
    const type = shuffledTypes[i];
    const events = EVENT_TYPE_MAP[type];
    const event = events[Math.floor(Math.random() * events.length)];
    board.push({
      id: i + 1,
      type,
      event: { ...event }
    });
  }

  board.push({
    id: GOAL_POSITION,
    type: 'goal',
    event: { title: 'ゴール！', description: 'お疲れ様！ゴール到達！', severity: 'none' }
  });

  return board;
}

class GameManager {
  private finishCounter: Map<string, number> = new Map();

  startGame(room: Room): GameState {
    room.players = shuffleArray(room.players);
    room.players.forEach((player) => {
      player.position = 0;
      player.isFinished = false;
      player.finishOrder = undefined;
    });

    this.finishCounter.set(room.id, 0);

    const gameState: GameState = {
      currentPlayerIndex: 0,
      board: generateBoard(),
      turnCount: 1
    };

    return gameState;
  }

  spin(room: Room): {
    player: Player;
    steps: number;
    landed: BoardSquare;
    isFinished: boolean;
  } {
    if (!room.gameState) {
      throw new Error('Game has not started');
    }

    const currentPlayer = room.players[room.gameState.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isFinished) {
      throw new Error('Invalid current player');
    }

    const steps = Math.floor(Math.random() * (MAX_STEPS - MIN_STEPS + 1)) + MIN_STEPS;

    const newPosition = currentPlayer.position + steps;
    currentPlayer.position = Math.min(newPosition, GOAL_POSITION);

    const landed = room.gameState.board[currentPlayer.position];

    let isFinished = false;
    if (currentPlayer.position >= GOAL_POSITION) {
      currentPlayer.position = GOAL_POSITION;
      currentPlayer.isFinished = true;
      const currentFinishCount = this.finishCounter.get(room.id) || 0;
      const nextFinishOrder = currentFinishCount + 1;
      this.finishCounter.set(room.id, nextFinishOrder);
      currentPlayer.finishOrder = nextFinishOrder;
      isFinished = true;
    }

    return {
      player: currentPlayer,
      steps,
      landed,
      isFinished
    };
  }

  nextTurn(room: Room): {
    currentPlayerIndex: number;
    turnCount: number;
  } {
    if (!room.gameState) {
      throw new Error('Game has not started');
    }

    const allFinished = room.players.every(p => p.isFinished);
    if (allFinished) {
      return {
        currentPlayerIndex: room.gameState.currentPlayerIndex,
        turnCount: room.gameState.turnCount
      };
    }

    let nextIndex = room.gameState.currentPlayerIndex;
    let attempts = 0;

    do {
      nextIndex = (nextIndex + 1) % room.players.length;
      attempts++;
      if (attempts > room.players.length) {
        break;
      }
    } while (room.players[nextIndex].isFinished);

    const newTurnCount = nextIndex <= room.gameState.currentPlayerIndex
      ? room.gameState.turnCount + 1
      : room.gameState.turnCount;

    room.gameState.currentPlayerIndex = nextIndex;
    room.gameState.turnCount = newTurnCount;

    return {
      currentPlayerIndex: nextIndex,
      turnCount: newTurnCount
    };
  }
}

export const gameManager = new GameManager();
