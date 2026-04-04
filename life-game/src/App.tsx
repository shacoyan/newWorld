import { Routes, Route, useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Room, Player, GamePhase, DrinkEvent, SpinResult } from './types';
import { useSocket } from './hooks/useSocket';
import Lobby from './components/Room/Lobby';
import WaitingRoom from './components/Room/WaitingRoom';
import Result from './components/Room/Result';
import Board from './components/Board/Board';
import PlayerInfo from './components/Player/PlayerInfo';
import Roulette from './components/Roulette/Roulette';
import EventCard from './components/EventCard/EventCard';

function GamePage() {
  const { socket } = useSocket();
  const { roomId } = useParams<{ roomId: string }>();

  const [room, setRoom] = useState<Room | null>(null);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [currentEvent, setCurrentEvent] = useState<DrinkEvent | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('room:updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    socket.on('error', (err: { message: string }) => {
      console.error('Server error:', err.message);
      alert(err.message);
    });

    socket.on('game:started', (data: { room: Room; gameState: Room['gameState'] }) => {
      setRoom(data.room);
      setPhase('rolling');
      setDiceResult(null);
      setCurrentEvent(null);
    });

    socket.on('game:spin-result', (data: SpinResult) => {
      setDiceResult(data.steps);

      setRoom(prev => {
        if (!prev) return null;
        const updatedPlayers = prev.players.map(p =>
          p.id === data.player.id ? { ...data.player } : p
        );
        return { ...prev, players: updatedPlayers };
      });

      if (data.landed && data.landed.event && data.landed.type !== 'start' && data.landed.type !== 'goal') {
        setCurrentEvent(data.landed.event);
        setPhase('event');
      } else {
        setCurrentEvent(null);
      }
    });

    socket.on('game:player-finished', (data: { player: Player; finishOrder: number }) => {
      setRoom(prev => {
        if (!prev) return null;
        const updatedPlayers = prev.players.map(p =>
          p.id === data.player.id ? { ...p, isFinished: true, finishOrder: data.finishOrder } : p
        );
        return { ...prev, players: updatedPlayers };
      });
    });

    socket.on('game:turn-changed', (data: { currentPlayerIndex: number; turnCount: number; players: Player[] }) => {
      setRoom(prev => {
        if (!prev || !prev.gameState) return prev;
        return {
          ...prev,
          players: data.players,
          gameState: {
            ...prev.gameState,
            currentPlayerIndex: data.currentPlayerIndex,
            turnCount: data.turnCount,
          },
        };
      });
      setPhase('rolling');
      setDiceResult(null);
      setCurrentEvent(null);
    });

    socket.on('game:finished', (data: { room: Room }) => {
      setRoom(data.room);
      setPhase('finished');
    });

    return () => {
      socket.off('room:updated');
      socket.off('error');
      socket.off('game:started');
      socket.off('game:spin-result');
      socket.off('game:player-finished');
      socket.off('game:turn-changed');
      socket.off('game:finished');
    };
  }, [socket]);

  const myPlayer = useMemo<Player | undefined>(() => {
    if (!room) return undefined;
    return room.players.find((p) => p.socketId === socket?.id);
  }, [room, socket]);

  const isHost = useMemo(() => {
    if (!room || !myPlayer) return false;
    return room.hostId === myPlayer.id;
  }, [room, myPlayer]);

  const isMyTurn = useMemo(() => {
    if (!room || !room.gameState || !myPlayer) return false;
    const myIndex = room.players.findIndex(p => p.id === myPlayer.id);
    return room.gameState.currentPlayerIndex === myIndex;
  }, [room, myPlayer]);

  const handleStart = () => {
    if (socket && room) {
      socket.emit('game:start', room.id);
    }
  };

  const handleSpin = () => {
    if (socket && room) {
      socket.emit('game:spin', room.id);
    }
  };

  const handleEventDone = () => {
    if (socket && room) {
      socket.emit('game:event-done', room.id);
    }
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {room.status === 'waiting' && (
        <WaitingRoom room={room} isHost={isHost} onStart={handleStart} />
      )}
      {room.status === 'playing' && room.gameState && (
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Board gameState={room.gameState} players={room.players} />
            </div>
            <div className="space-y-4">
              {room.players.map((player, idx) => (
                <PlayerInfo
                  key={player.id}
                  player={player}
                  isCurrentTurn={room.gameState!.currentPlayerIndex === idx}
                />
              ))}
              <Roulette
                onSpin={handleSpin}
                result={diceResult}
                isMyTurn={isMyTurn}
                spinning={phase === 'rolling' && diceResult === null && isMyTurn}
              />
              {currentEvent && (
                <EventCard
                  event={currentEvent}
                  onDone={handleEventDone}
                />
              )}
            </div>
          </div>
        </div>
      )}
      {room.status === 'finished' && (
        <Result players={room.players} />
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LobbyWrapper />} />
      <Route path="/room/:roomId" element={<GamePage />} />
    </Routes>
  );
}

function LobbyWrapper() {
  const { socket } = useSocket();
  return <Lobby socket={socket} />;
}

export default App;
