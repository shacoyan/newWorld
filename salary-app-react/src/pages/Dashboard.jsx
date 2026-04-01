import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import Header from '../components/Header'
import { getTodayKey, formatDateLabel, formatMoney, calcMonthlyTotal, calcPeriodRange, calcDailyWage, calcHours } from '../lib/calc'

export default function Dashboard() {
  const user = useAuth();
  const { data, persistData } = useAppData(user);

  const todayKey = getTodayKey();
  const parts = todayKey.split('-').map(Number);
  const [year, setYear] = useState(parts[0]);
  const [month, setMonth] = useState(parts[1]);

  if (!data) return null;

  const monthly = calcMonthlyTotal(year, month, data);
  const total = monthly.total || 0;
  const wageTotal = monthly.wageTotal || 0;
  const backTotal = monthly.backTotal || 0;
  const payPeriodStart = data.settings?.payPeriodStart || 1;
  const range = calcPeriodRange(year, month, payPeriodStart);

  let workDays = 0;
  let workTotal = 0;
  let bestDayAmount = 0;
  let bestDayKey = '';
  let totalWorkMinutes = 0;
  const itemCounts = {};

  const start = new Date(range.startDate);
  const end = new Date(range.endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;

    const rec = data.records ? data.records[key] : null;
    if (rec) {
      const dw = calcDailyWage(rec, data.settings);
      if (dw.total > 0) {
        workDays++;
        workTotal += dw.total;
        if (dw.total > bestDayAmount) {
          bestDayAmount = dw.total;
          bestDayKey = key;
        }
      }

      if (rec.startTime && rec.endTime) {
        totalWorkMinutes += calcHours(rec.startTime, rec.endTime) * 60;
      }

      if (rec.items && data.settings && data.settings.items) {
        data.settings.items.forEach(item => {
          const count = rec.items[item.id] || 0;
          if (count > 0) {
            if (!itemCounts[item.name]) itemCounts[item.name] = { count: 0, back: 0 };
            itemCounts[item.name].count += count;
            itemCounts[item.name].back += (item.back || 0) * count;
          }
        });
      }
    }
  }

  const avgDaily = workDays > 0 ? workTotal / workDays : 0;
  const totalHours = totalWorkMinutes / 60;
  const avgHourly = totalHours > 0 ? workTotal / totalHours : 0;

  const maxItemBack = Math.max(...Object.values(itemCounts).map(v => v.back), 1);

  const backPercent = total > 0 ? (backTotal / total) * 100 : 0;
  const wagePercent = total > 0 ? (wageTotal / total) * 100 : 100;

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  return (
    <div>
      <Header />

      <main style={{ paddingTop: '56px' }}>
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>統計</h1>
        </div>
        <div className="dash-month-nav">
          <button className="month-nav-btn" onClick={prevMonth} aria-label="前の月">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="dash-month-info">
            <div id="dash-month-label">{year}年{month}月</div>
            <div id="period-label">{fmtDate(range.startDate)} 〜 {fmtDate(range.endDate)}</div>
          </div>
          <button className="month-nav-btn" onClick={nextMonth} aria-label="次の月">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="section">
          <div className="dash-total-hero">
            <div className="dash-total-label">今月の合計</div>
            <div className="dash-total-value">{formatMoney(total)}</div>
          </div>
          <div className="dash-sub-cards">
            <div className="dash-sub-card">
              <div className="dash-sub-label">時給計</div>
              <div className="dash-sub-value">{formatMoney(wageTotal)}</div>
            </div>
            <div className="dash-sub-card">
              <div className="dash-sub-label">バック計</div>
              <div className="dash-sub-value">{formatMoney(backTotal)}</div>
            </div>
            <div className="dash-sub-card">
              <div className="dash-sub-label">バック比率</div>
              <div className="dash-sub-value">{backPercent.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">稼働情報</h2>
          <div className="total-line">
            <span className="total-label">稼働日数</span>
            <span className="total-value">{workDays}日</span>
          </div>
          <div className="total-line">
            <span className="total-label">平均日給</span>
            <span className="total-value">{formatMoney(Math.round(avgDaily))}</span>
          </div>
          <div className="total-line">
            <span className="total-label">最高収入日</span>
            <span className="total-value">{bestDayKey ? formatDateLabel(bestDayKey) + ' ' + formatMoney(bestDayAmount) : '-'}</span>
          </div>
          <div className="total-line">
            <span className="total-label">稼働時間</span>
            <span className="total-value">{Math.round(totalHours)}時間</span>
          </div>
          <div className="total-line">
            <span className="total-label">平均時給</span>
            <span className="total-value">{formatMoney(Math.round(avgHourly))}</span>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">品目別バック</h2>
          {Object.entries(itemCounts).sort((a, b) => b[1].back - a[1].back).map(([name, val]) => (
            <div className="dash-item-row" key={name}>
              <div className="dash-item-header">
                <span className="dash-item-name">{name}</span>
                <span className="dash-item-stats">{val.count}回 · {formatMoney(val.back)}</span>
              </div>
              <div className="dash-bar-bg">
                <div className="dash-bar-fill" style={{ width: (val.back / maxItemBack * 100) + '%' }}></div>
              </div>
            </div>
          ))}
          {Object.keys(itemCounts).length === 0 && <div className="dash-empty">データなし</div>}
        </div>

        <div className="section">
          <h2 className="section-title">内訳比率</h2>
          <div className="ratio-labels">
            <span className="ratio-label-wage">時給 {wagePercent.toFixed(1)}%</span>
            {backPercent > 0 && <span className="ratio-label-back">バック {backPercent.toFixed(1)}%</span>}
          </div>
          <div className="ratio-bar-wrap-new">
            <div
              className="ratio-bar-wage-new"
              style={{ width: (backPercent === 0 ? 100 : wagePercent) + '%' }}
            />
            {backPercent > 0 && (
              <div
                className="ratio-bar-back-new"
                style={{ width: backPercent + '%' }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
