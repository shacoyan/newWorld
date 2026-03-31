import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { getTodayKey, formatDateLabel, formatMoney, calcMonthlyTotal, calcPeriodRange, calcDailyWage, calcHours, escapeHtml } from '../lib/calc'

export default function Dashboard() {
  const user = useAuth();
  const { data, persistData } = useAppData(user);
  const navigate = useNavigate();

  const todayKey = getTodayKey();
  const parts = todayKey.split('-').map(Number);
  const [year, setYear] = useState(parts[0]);
  const [month, setMonth] = useState(parts[1]);

  if (!data) return null;

  const displayName = user?.displayName || user?.email || '';
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

  const start = new Date(range.startDate + 'T00:00:00');
  const end = new Date(range.endDate + 'T00:00:00');

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;

    const rec = data.records ? data.records[key] : null;
    if (rec) {
      const dw = calcDailyWage(rec, data.settings);
      if (dw > 0) {
        workDays++;
        workTotal += dw;
        if (dw > bestDayAmount) {
          bestDayAmount = dw;
          bestDayKey = key;
        }
      }

      if (rec.startTime && rec.endTime) {
        totalWorkMinutes += calcHours(rec.startTime, rec.endTime) * 60;
      }

      if (rec.items) {
        for (const item of rec.items) {
          const name = item.name || '';
          if (!itemCounts[name]) {
            itemCounts[name] = { count: 0, back: 0 };
          }
          itemCounts[name].count += (item.count || 0);
          itemCounts[name].back += (item.back || 0) * (item.count || 0);
        }
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

  return (
    <div>
      <header>
        <Link to="/" className="header-logo-link">
          <img src="/logo.png" alt="こんまに" className="header-logo" />
        </Link>
        <h1 className="header-title">統計</h1>
        <div className="user-chip-small">
          <span className="user-initial">{displayName.charAt(0) || '?'}</span>
          <span>{displayName}</span>
        </div>
      </header>

      <main>
        <div className="dash-month-nav">
          <button className="month-nav-btn" onClick={prevMonth}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="dash-month-info">
            <div id="dash-month-label">{year}年{month}月</div>
            <div id="period-label">{range.startDate} 〜 {range.endDate}</div>
          </div>
          <button className="month-nav-btn" onClick={nextMonth}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="section">
          <div className="dash-cards">
            <div className="dash-card">
              <div className="dash-card-label">合計</div>
              <div className="dash-card-value">{formatMoney(total)}</div>
            </div>
            <div className="dash-card">
              <div className="dash-card-label">時給計</div>
              <div className="dash-card-value">{formatMoney(wageTotal)}</div>
            </div>
            <div className="dash-card">
              <div className="dash-card-label">バック計</div>
              <div className="dash-card-value">{formatMoney(backTotal)}</div>
            </div>
            <div className="dash-card">
              <div className="dash-card-label">バック比率</div>
              <div className="dash-card-value">{backPercent.toFixed(1)}%</div>
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
            <span className="total-value">{formatMoney(avgDaily)}</span>
          </div>
          <div className="total-line">
            <span className="total-label">最高収入日</span>
            <span className="total-value">{bestDayKey ? formatDateLabel(bestDayKey) + ' ' + formatMoney(bestDayAmount) : '-'}</span>
          </div>
          <div className="total-line">
            <span className="total-label">稼働時間</span>
            <span className="total-value">{totalHours.toFixed(1)}時間</span>
          </div>
          <div className="total-line">
            <span className="total-label">平均時給</span>
            <span className="total-value">{formatMoney(avgHourly)}</span>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">品目別バック</h2>
          <div className="item-breakdown">
            {Object.entries(itemCounts).sort((a, b) => b[1].back - a[1].back).map(([name, val]) => (
              <div className="item-row" key={name}>
                <div className="item-info">
                  <span className="item-name">{escapeHtml(name)}</span>
                  <span className="item-count">{val.count}回</span>
                  <span className="item-back">{formatMoney(val.back)}</span>
                </div>
                <div className="item-bar-bg">
                  <div className="item-bar" style={{ width: (val.back / maxItemBack * 100) + '%' }}></div>
                </div>
              </div>
            ))}
            {Object.keys(itemCounts).length === 0 && <div className="item-empty">データなし</div>}
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">内訳比率</h2>
          <div className="ratio-bar-wrap">
            <div
              className="ratio-bar ratio-bar-wage"
              style={{ width: (backPercent === 0 ? 100 : wagePercent) + '%' }}
            >
              時給 {wagePercent.toFixed(1)}%
            </div>
            <div
              className="ratio-bar ratio-bar-back"
              style={{ width: backPercent.toFixed(1) + '%', display: backPercent === 0 ? 'none' : undefined }}
            >
              バック {backPercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
