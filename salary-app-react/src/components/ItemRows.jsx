import { useState } from 'react';
import { formatMoney } from '../lib/calc';

export default function ItemRows({ items, record, onCountChange }) {
  const castItems = items.filter(i => i.category !== 'champagne');
  const champItems = items.filter(i => i.category === 'champagne');
  const [champOpen, setChampOpen] = useState(false);

  function makeRow(item) {
    const count = record.items?.[item.id] || 0;
    return (
      <div className="item-count-row" key={item.id}>
        <span className="item-back-label">{formatMoney(item.price || 0)}</span>
        <span className="item-name">{item.name}</span>
        <button className="item-dec" onClick={() => onCountChange(item.id, count - 1)}>-</button>
        <span className="item-count-val">{count}</span>
        <button className="item-inc" onClick={() => onCountChange(item.id, count + 1)}>+</button>
      </div>
    );
  }

  return (
    <div>
      {castItems.map(item => makeRow(item))}
      {champItems.length > 0 && (
        <>
          <button className="btn-champagne-toggle" onClick={() => setChampOpen(prev => !prev)}>
            シャンパン {champOpen ? '▼' : '▶'}
          </button>
          <div className="champagne-items-wrap" style={{ display: champOpen ? 'block' : 'none' }}>
            {champItems.map(item => makeRow(item))}
          </div>
        </>
      )}
    </div>
  );
}
