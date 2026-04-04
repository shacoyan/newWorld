// FILE: src/components/Room/WaitingRoom.tsx
import { useState } from 'react';
import { Room } from '../../types';

interface WaitingRoomProps {
  room: Room;
  isHost: boolean;
  onStart: () => void;
}

function WaitingRoom(props: WaitingRoomProps) {
  const { room, isHost, onStart } = props;
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ルーム待機中</h2>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 space-y-6">
          {/* Room Code */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">ルームコード</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-mono bg-gray-700 px-4 py-2 rounded tracking-widest">
                {room.id}
              </span>
              <button
                onClick={handleCopy}
                className="bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 transition-colors text-sm"
              >
                {copied ? 'コピーしました!' : 'コピー'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              友達にこのコードを共有してください
            </p>
          </div>

          {/* Player List */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              参加者 ({room.players.length}人)
            </h3>
            <div className="space-y-2">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 bg-gray-700 rounded-lg px-4 py-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-medium">{player.name}</span>
                  {room.hostId === player.id && <span className="text-lg">👑</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          {isHost && (
            <div>
              <button
                onClick={onStart}
                disabled={room.players.length < 2}
                className={`w-full rounded-lg px-6 py-3 font-bold text-lg transition-colors ${
                  room.players.length >= 2
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-green-500 opacity-50 cursor-not-allowed'
                }`}
              >
                ゲーム開始
              </button>
              {room.players.length < 2 && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  2人以上で開始できます
                </p>
              )}
            </div>
          )}

          {!isHost && (
            <div className="text-center text-gray-400 text-sm">
              ホストがゲームを開始するのを待っています...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WaitingRoom;
