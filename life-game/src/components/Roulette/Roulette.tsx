// FILE: src/components/Roulette/Roulette.tsx
import { useEffect, useState } from 'react';

function Roulette(props: {
  onSpin: () => void;
  result: number | null;
  isMyTurn: boolean;
  spinning: boolean;
}) {
  const { onSpin, result, isMyTurn, spinning } = props;
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!spinning) return;

    const interval = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 6) + 1);
    }, 50);

    return () => clearInterval(interval);
  }, [spinning]);

  const displayValue = spinning
    ? displayNumber
    : result !== null
    ? result
    : '?';

  return (
    <div className="bg-gray-800 rounded-xl p-6 text-center">
      <div className="text-6xl font-bold text-white mb-6 h-20 flex items-center justify-center">
        {displayValue}
      </div>
      <button
        onClick={onSpin}
        disabled={!isMyTurn || spinning}
        className={`bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-colors ${
          !isMyTurn || spinning ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        回す!
      </button>
    </div>
  );
}

export default Roulette;
