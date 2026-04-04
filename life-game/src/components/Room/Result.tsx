// FILE: src/components/Room/Result.tsx
import { useNavigate } from 'react-router-dom';
import { Player } from '../../types';

interface ResultProps {
  players: Player[];
}

function Result(props: ResultProps) {
  const { players } = props;
  const navigate = useNavigate();

  const sortedPlayers = [...players].sort((a, b) => {
    const rankA = a.finishOrder ?? 999;
    const rankB = b.finishOrder ?? 999;
    return rankA - rankB;
  });

  const getRankDisplay = (rank: number | undefined): string => {
    if (rank === undefined) return '---';
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}位`;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">ゲーム終了!</h2>
          <p className="text-gray-400">お疲れ様でした!</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-center mb-4">最終結果</h3>

          {sortedPlayers.map((player) => {
            const rank = player.finishOrder;
            const isFirst = rank === 1;

            return (
              <div
                key={player.id}
                className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
                  isFirst
                    ? 'bg-yellow-900/30 ring-2 ring-yellow-500'
                    : 'bg-gray-700'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                    isFirst ? 'text-2xl' : 'text-xl'
                  }`}
                >
                  {getRankDisplay(rank)}
                </div>
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: player.color }}
                />
                <span
                  className={`font-bold ${
                    isFirst ? 'text-2xl text-yellow-300' : 'text-lg'
                  }`}
                >
                  {player.name}
                </span>
                {isFirst && (
                  <span className="ml-auto text-yellow-400 font-bold">優勝!</span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-pink-500 hover:bg-pink-600 rounded-lg px-6 py-3 font-bold transition-colors"
        >
          ロビーに戻る
        </button>
      </div>
    </div>
  );
}

export default Result;
