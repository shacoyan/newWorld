import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { roomManager } from './roomManager';
import { gameManager } from './gameManager';

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  let currentRoomId: string | null = null;

  socket.on('room:create', (hostName: string) => {
    try {
      const room = roomManager.createRoom(hostName, socket.id);
      currentRoomId = room.id;
      socket.join(room.id);
      socket.emit('room:created', room);
    } catch (error) {
      socket.emit('error', { message: (error as Error).message });
    }
  });

  socket.on('room:join', ({ roomId, playerName }: { roomId: string; playerName: string }) => {
    try {
      const room = roomManager.joinRoom(roomId, playerName, socket.id);
      currentRoomId = room.id;
      socket.join(room.id);
      io.to(room.id).emit('room:updated', room);
    } catch (error) {
      socket.emit('error', { message: (error as Error).message });
    }
  });

  socket.on('game:start', (roomId: string) => {
    try {
      const room = roomManager.getRoom(roomId);
      if (!room) {
        throw new Error('Room not found');
      }
      if (room.hostId !== room.players.find(p => p.socketId === socket.id)?.id) {
        throw new Error('Only host can start the game');
      }
      const gameState = gameManager.startGame(room);
      room.status = 'playing';
      room.gameState = gameState;
      io.to(roomId).emit('game:started', { room, gameState });
    } catch (error) {
      socket.emit('error', { message: (error as Error).message });
    }
  });

  socket.on('game:spin', (roomId: string) => {
    try {
      const room = roomManager.getRoom(roomId);
      if (!room || !room.gameState) {
        throw new Error('Game not found');
      }

      // 手番プレイヤーの認証
      const currentPlayer = room.players[room.gameState.currentPlayerIndex];
      if (!currentPlayer || currentPlayer.socketId !== socket.id) {
        throw new Error('Not your turn');
      }

      const result = gameManager.spin(room);

      io.to(roomId).emit('game:spin-result', {
        player: result.player,
        steps: result.steps,
        landed: result.landed,
        isFinished: result.isFinished
      });

      if (result.isFinished) {
        io.to(roomId).emit('game:player-finished', {
          player: result.player,
          finishOrder: result.player.finishOrder
        });

        const allFinished = room.players.every(p => p.isFinished);
        if (allFinished) {
          room.status = 'finished';
          io.to(roomId).emit('game:finished', { room });
        }
      }
    } catch (error) {
      socket.emit('error', { message: (error as Error).message });
    }
  });

  socket.on('game:event-done', (roomId: string) => {
    try {
      const room = roomManager.getRoom(roomId);
      if (!room || !room.gameState) {
        throw new Error('Game not found');
      }

      // 手番プレイヤーの認証
      const currentPlayer = room.players[room.gameState.currentPlayerIndex];
      if (!currentPlayer || currentPlayer.socketId !== socket.id) {
        throw new Error('Not your turn');
      }

      const turnInfo = gameManager.nextTurn(room);
      room.gameState.currentPlayerIndex = turnInfo.currentPlayerIndex;
      room.gameState.turnCount = turnInfo.turnCount;

      io.to(roomId).emit('game:turn-changed', {
        currentPlayerIndex: turnInfo.currentPlayerIndex,
        turnCount: turnInfo.turnCount,
        players: room.players
      });
    } catch (error) {
      socket.emit('error', { message: (error as Error).message });
    }
  });

  socket.on('disconnect', () => {
    if (!currentRoomId) return;

    const room = roomManager.getRoom(currentRoomId);
    const wasCurrentTurn = room?.gameState
      ? room.players[room.gameState.currentPlayerIndex]?.socketId === socket.id
      : false;

    const result = roomManager.removePlayer(socket.id);
    if (result) {
      socket.leave(result.room.id);
      if (!result.isEmpty) {
        // ゲーム中の場合、currentPlayerIndexを調整
        if (result.room.status === 'playing' && result.room.gameState) {
          const gs = result.room.gameState;
          // インデックスが範囲外にならないよう調整
          if (gs.currentPlayerIndex >= result.room.players.length) {
            gs.currentPlayerIndex = 0;
          }
          // 切断したのが手番プレイヤーだった場合、次のターンへ
          if (wasCurrentTurn) {
            // finishedプレイヤーをスキップ
            let attempts = 0;
            while (result.room.players[gs.currentPlayerIndex]?.isFinished && attempts < result.room.players.length) {
              gs.currentPlayerIndex = (gs.currentPlayerIndex + 1) % result.room.players.length;
              attempts++;
            }
            io.to(result.room.id).emit('game:turn-changed', {
              currentPlayerIndex: gs.currentPlayerIndex,
              turnCount: gs.turnCount,
              players: result.room.players
            });
          }
          // 全員ゴール済みチェック
          const allFinished = result.room.players.every(p => p.isFinished);
          if (allFinished) {
            result.room.status = 'finished';
            io.to(result.room.id).emit('game:finished', { room: result.room });
          }
        }
        io.to(result.room.id).emit('room:updated', result.room);
      }
    }
    currentRoomId = null;
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Life Game server running on port ${PORT}`);
});

export { io };
