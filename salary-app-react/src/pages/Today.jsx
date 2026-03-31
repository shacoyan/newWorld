import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../hooks/useAppData';
import { getTodayKey, formatDateLabel, formatMoney, ensureRecord, calcDailyWage, getDaysInMonth, calcMonthlyTotal } from '../lib/calc';
import ItemRows from '../components/ItemRows';

export default function Today() {
  const user = useAuth();
  const { data, persistData } = useAppData(user);
  const navigate = useNavigate();
  const todayKey = getTodayKey();
  const [calYear, setCalYear] = useState(() => parseInt(todayKey.split('-')[0]));
  const [calMonth, setCalMonth] = useState(() => parseInt(todayKey.split('-')[1]));

  if (!data) return null;

  const todayRec = data.records[todayKey] || { startTime: '', endTime: '', hourlyRate: data.settings.defaultHourlyRate || 0, items: {} };
  const daily = calcDailyWage(todayRec, data.settings);
  const monthly = calcMonthlyTotal(calYear, calMonth, data);
  const step = (data.settings.timeStep || 1) === 15 ? 900 : 60;
  const displayName = user ? (user.displayName || user.email || '') : '';

  function handleTimeChange(field, value) {
    const newData = ensureRecord(data, todayKey);
    newData.records[todayKey][field] = value;
    persistData(newData);
  }

  function handleRateChange(value) {
    const v = parseInt(value, 10);
    if (!isNaN(v) && v >= 0) {
      const newData = ensureRecord(data, todayKey);
      newData.records[todayKey].hourlyRate = v;
      persistData(newData);
    }
  }

  function handleCheckin() {
    const start = data.settings.defaultStartTime || '';
    const end = data.settings.defaultEndTime || '';
    if (!start && !end) {
      alert('デフォルト出勤・退勤時刻が設定されていません。設定画面から登録してください。');
      return;
    }
    const newData = ensureRecord(data, todayKey);
    if (start) newData.records[todayKey].startTime = start;
    if (end) newData.records[todayKey].endTime = end;
    persistData(newData);
  }

  function handleItemCount(itemId, newCount) {
    const newData = ensureRecord(data, todayKey);
    if (newCount <= 0) delete newData.records[todayKey].items[itemId];
    else newData.records[todayKey].items[itemId] = Math.min(newCount, 9999);
    persistData(newData);
  }

  const firstDow = new Date(calYear, calMonth - 1, 1).getDay();
  const daysInMon = getDaysInMonth(calYear, calMonth);
  const calCells = [];
  
  for (let i = 0; i < firstDow; i++) calCells.push(null);
  for (let d = 1; d <= daysInMon; d++) {
    const dk = calYear + '-' + String(calMonth).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const rec = data.records[dk];
    const dw = new Date(calYear, calMonth - 1, d).getDay();
    const dly = rec ? calcDailyWage(rec, data.settings) : null;
    calCells.push({ d, dk, rec, dly, dw, isToday: dk === todayKey });
  }

  return (
    <div id="app-content">
      <header>
        <Link to="/" className="header-logo-link" aria-label="今日の画面へ">
          <img src="/logo.png" alt="こんまに" className="header-logo" />
        </Link>
        <div className="header-right">
          <div className="user-chip">
            <span className="user-initial">{displayName ? displayName.charAt(0).toUpperCase() : '?'}</span>
            <span>{displayName}</span>
          </div>
          <button onClick={() => navigate('/dashboard')}>統計</button>
          <button onClick={() => navigate('/settings')}>設定</button>
        </div>
      </header>
      <main>
        <section id="today-section">
          <h2 id="today-label">今日: {formatDateLabel(todayKey)}</h2>
          <div className="section">
            <div className="time-group">
              <span>出勤</span>
              <input type="time" className="time-start" step={step} value={todayRec.startTime || ''} onChange={e => handleTimeChange('startTime', e.target.value)} aria-label="出勤時刻" />
              <span>〜</span>
              <span>退勤</span>
              <input type="time" className="time-end" step={step} value={todayRec.endTime || ''} onChange={e => handleTimeChange('endTime', e.target.value)} aria-label="退勤時刻" />
            </div>
            <div className="time-group">
              <span>時給</span>
              <input type="number" className="daily-hourly-rate" min="0" step="1" value={todayRec.hourlyRate || ''} onChange={e => handleRateChange(e.target.value)} aria-label="時給" />
              <span>円</span>
            </div>
            <button className="btn-checkin-today" onClick={handleCheckin}>出勤登録（デフォルト時刻をセット）</button>
          </div>
          <div className="section">
            <ItemRows items={data.settings.items || []} record={todayRec} onCountChange={handleItemCount} />
          </div>
          <div id="today-summary" className="section">
            <div className="total-line"><span>時給分</span><span>{formatMoney(daily.wage)}</span></div>
            <div className="total-line"><span>バック</span><span>{formatMoney(daily.back)}</span></div>
            <div className="total-line grand"><span>今日の合計</span><span className="amount">{formatMoney(daily.total)}</span></div>
          </div>
        </section>
        <section className="section" id="calendar-section">
          <div className="calendar-header">
            <span style={{ fontSize: '16px', fontWeight: '700' }}>{calYear}年{calMonth}月</span>
            <div className="calendar-nav">
              <button onClick={() => { if (calMonth <= 1) { setCalMonth(12); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}>&#8249;</button>
              <button onClick={() => { if (calMonth >= 12) { setCalMonth(1); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}>&#8250;</button>
            </div>
          </div>
          <div id="calendar-weekdays">
            {['日', '月', '火', '水', '木', '金', '土'].map(w => <span key={w}>{w}</span>)}
          </div>
          <div id="calendar-grid">
            {calCells.map((cell, i) => {
              if (!cell) return <div key={'e' + i} className="day-cell empty" />;
              const cls = ['day-cell', cell.isToday ? 'today' : '', cell.dw === 0 ? 'sunday' : '', cell.dw === 6 ? 'saturday' : ''].filter(Boolean).join(' ');
              return (
                <div key={cell.dk} className={cls} onClick={() => navigate('/day?date=' + cell.dk)}>
                  <div className="cell-date">{cell.d}</div>
                  <div className="cell-total">{cell.dly && cell.dly.total > 0 ? formatMoney(cell.dly.total) : ''}</div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

