// FILE: src/components/Room/Lobby.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

interface LobbyProps {
  socket: Socket | null;
}

function Lobby(props: LobbyProps) {
  const { socket } = props;
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (room: { id: string }) => {
      navigate(`/room/${room.id}`);
    };

    const handleUpdated = (room: { id: string }) => {
      navigate(`/room/${room.id}`);
    };

    socket.on('room:created', handleCreated);
    socket.on('room:updated', handleUpdated);

    return () => {
      socket.off('room:created', handleCreated);
      socket.off('room:updated', handleUpdated);
    };
  }, [socket, navigate]);

  const handleCreateRoom = () => {
    if (!socket || !playerName.trim()) return;
    socket.emit('room:create', playerName.trim());
  };

  const handleJoinRoom = () => {
    if (!socket || !playerName.trim() || !roomCode.trim()) return;
    socket.emit('room:join', { roomId: roomCode.trim(), playerName: playerName.trim() });
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-pink-500 text-4xl font-bold mb-2">🍻 飲み人生ゲーム</h1>
          <p className="text-gray-400">友達と一緒に飲みながら人生ゲーム!</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 shadow-lg space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              プレイヤー名
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="名前を入力..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              maxLength={20}
            />
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={!playerName.trim()}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg px-6 py-3 font-bold transition-colors"
          >
            ルームを作成
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">または</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ルームコード
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="コードを入力..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={!playerName.trim() || !roomCode.trim()}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg px-6 py-3 font-bold transition-colors"
          >
            参加する
          </button>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
