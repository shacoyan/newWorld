// FILE: src/components/Board/Square.tsx
import { BoardSquare } from '../../types';

const typeColorMap: Record<BoardSquare['type'], string> = {
  'drink-self': '#FF6B9D',
  'drink-target': '#00D4FF',
  'drink-all': '#FFE66D',
  challenge: '#FF4444',
  lucky: '#7CFF6B',
  special: '#B06BFF',
  start: 'gold',
  goal: 'gold',
};

const textBlackTypes: BoardSquare['type'][] = [
  'drink-all',
  'lucky',
  'start',
  'goal',
];

import { memo } from 'react';

const Square = memo(function Square(props: { square: BoardSquare; isActive: boolean }) {
  const { square, isActive } = props;

  const backgroundColor = typeColorMap[square.type];
  const textClass = textBlackTypes.includes(square.type)
    ? 'text-black'
    : 'text-white';

  return (
    <div
      className={`min-h-[70px] w-full rounded-lg p-1 ${textClass} ${
        isActive ? 'ring-2 ring-white shadow-lg shadow-white/30' : ''
      }`}
      style={{ backgroundColor }}
    >
      <div className="text-xs opacity-70">{square.id}</div>
      <div className="flex items-center justify-center text-sm font-semibold h-full">
        {square.event.title}
      </div>
    </div>
  );
});

export default Square;
