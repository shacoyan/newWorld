import { useState } from 'react';
import { formatMoney } from '../lib/calc';
import AnimatedMoney from './AnimatedMoney';

export default function ItemRows({ items, record, onCountChange }) {
  const castItems = items.filter(i => i.category !== 'champagne');
  const champItems = items.filter(i => i.category === 'champagne');
  const [champOpen, setChampOpen] = useState(false);

  function makeRow(item) {
    const count = record.items?.[item.id] || 0;
    const backAmount = (item.back || 0) * count;
    return (
      <div className="item-count-row" key={item.id}>
        {backAmount > 0
          ? <AnimatedMoney amount={backAmount} className="item-back-label" />
          : <span className="item-back-label">-</span>
        }
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
          <button
            className={`btn-champagne-toggle${champOpen ? ' is-open' : ''}`}
            onClick={() => setChampOpen(prev => !prev)}
          >
            シャンパン <span className="champ-arrow">▶</span>
          </button>
          <div className={`champagne-items-wrap${champOpen ? ' is-open' : ''}`}>
            {champItems.map(item => makeRow(item))}
          </div>
        </>
      )}
    </div>
  );
}
