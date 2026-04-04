// FILE: src/components/Player/PlayerInfo.tsx
import { Player } from '../../types';

import { memo } from 'react';

const PlayerInfo = memo(function PlayerInfo(props: { player: Player; isCurrentTurn: boolean }) {
  const { player, isCurrentTurn } = props;

  return (
    <div
      className={`bg-gray-800 rounded-xl p-4 border-l-4 ${
        isCurrentTurn ? 'ring-2 ring-pink-500' : ''
      }`}
      style={{ borderLeftColor: player.color }}
    >
      <div className="font-bold text-white">{player.name}</div>
      {player.finishOrder !== undefined ? (
        <div className="text-yellow-400 text-sm mt-1">
          {player.finishOrder}位でゴール!
        </div>
      ) : (
        <div className="text-gray-400 text-sm mt-1">マス {player.position}</div>
      )}
    </div>
  );
});

export default PlayerInfo;
