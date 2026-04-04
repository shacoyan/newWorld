export interface Room {
  id: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  hostId: string;
  gameState?: GameState;
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

export interface GameState {
  currentPlayerIndex: number;
  board: BoardSquare[];
  turnCount: number;
}

export interface BoardSquare {
  id: number;
  type: 'drink-self' | 'drink-target' | 'drink-all' | 'challenge' | 'lucky' | 'special' | 'start' | 'goal';
  event: DrinkEvent;
}

export interface DrinkEvent {
  title: string;
  description: string;
  severity: 'light' | 'medium' | 'heavy' | 'none';
}

const PLAYER_COLORS = ['#FF6B9D', '#00D4FF', '#FFE66D', '#7CFF6B'];
const ROOM_ID_LENGTH = 4;
const MAX_PLAYERS = 4;

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  private generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < ROOM_ID_LENGTH; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  private generateUniqueRoomId(): string {
    let id: string;
    let attempts = 0;
    do {
      id = this.generateRoomId();
      attempts++;
      if (attempts > 100) {
        id = this.generateRoomId() + Date.now().toString(36).slice(-2).toUpperCase();
        break;
      }
    } while (this.rooms.has(id));
    return id;
  }

  private generatePlayerId(): string {
    return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  }

  createRoom(hostName: string, socketId: string): Room {
    const roomId = this.generateUniqueRoomId();
    const hostPlayer: Player = {
      id: this.generatePlayerId(),
      socketId,
      name: hostName,
      position: 0,
      color: PLAYER_COLORS[0],
      isFinished: false
    };

    const room: Room = {
      id: roomId,
      players: [hostPlayer],
      status: 'waiting',
      hostId: hostPlayer.id
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, playerName: string, socketId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    if (room.status !== 'waiting') {
      throw new Error('Game has already started');
    }
    if (room.players.length >= MAX_PLAYERS) {
      throw new Error('Room is full');
    }

    const player: Player = {
      id: this.generatePlayerId(),
      socketId,
      name: playerName,
      position: 0,
      color: PLAYER_COLORS[room.players.length],
      isFinished: false
    };

    room.players.push(player);
    return room;
  }

  removePlayer(socketId: string): { room: Room; isEmpty: boolean } | null {
    for (const [roomId, room] of this.rooms) {
      const playerIndex = room.players.findIndex(p => p.socketId === socketId);
      if (playerIndex !== -1) {
        const removedPlayerId = room.players[playerIndex].id;
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          this.rooms.delete(roomId);
          return { room, isEmpty: true };
        }

        // ホストだった場合のみ、残った先頭プレイヤーにホスト権限を譲渡
        if (room.hostId === removedPlayerId) {
          room.hostId = room.players[0].id;
        }

        return { room, isEmpty: false };
      }
    }
    return null;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }
}

export const roomManager = new RoomManager();
