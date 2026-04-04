// FILE: src/components/EventCard/EventCard.tsx
import { DrinkEvent } from '../../types';

const severityBorderMap: Record<DrinkEvent['severity'], string> = {
  light: 'border-green-500',
  medium: 'border-yellow-500',
  heavy: 'border-red-500',
  none: 'border-blue-500',
};

const severityBadgeMap: Record<DrinkEvent['severity'], string> = {
  light: 'bg-green-500',
  medium: 'bg-yellow-500',
  heavy: 'bg-red-500',
  none: 'bg-blue-500',
};

const severityLabelMap: Record<DrinkEvent['severity'], string> = {
  light: '軽め',
  medium: '中程度',
  heavy: 'ヘビー',
  none: 'なし',
};

function EventCard(props: { event: DrinkEvent; onDone: () => void }) {
  const { event, onDone } = props;

  const borderColor = severityBorderMap[event.severity];
  const badgeColor = severityBadgeMap[event.severity];
  const badgeLabel = severityLabelMap[event.severity];

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`bg-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 border-t-4 ${borderColor}`}
      >
        <div className="mb-4">
          <span
            className={`${badgeColor} text-white rounded-full px-3 py-1 text-sm font-bold`}
          >
            {badgeLabel}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">{event.title}</h2>
        <p className="text-gray-300 mb-6">{event.description}</p>
        <button
          onClick={onDone}
          className="bg-pink-500 hover:bg-pink-600 text-white w-full rounded-lg px-6 py-3 font-bold transition-colors"
        >
          OK! 🍻
        </button>
      </div>
    </div>
  );
}

export default EventCard;
