// FILE: src/components/Player/PlayerToken.tsx
import { Player } from '../../types';

import { memo } from 'react';

const PlayerToken = memo(function PlayerToken(props: { player: Player; isCurrentTurn: boolean }) {
  const { player, isCurrentTurn } = props;

  const initial = player.name.charAt(0).toUpperCase();

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/50 shadow-md ${
        isCurrentTurn ? 'animate-pulse ring-2 ring-white' : ''
      }`}
      style={{ backgroundColor: player.color }}
    >
      {initial}
    </div>
  );
});

export default PlayerToken;
