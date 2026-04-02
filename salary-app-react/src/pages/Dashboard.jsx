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
  const [viewMode, setViewMode] = useState('month')

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
        if (dw.total > bestDayAmount) { bestDayAmount = dw.total; bestDayKey = key; }
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
  const goal = data.settings?.monthlyGoal || 0;
  const progressPercent = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;
  const isGoalAchieved = goal > 0 && total >= goal;
  const isPremium = data.settings?.isPremium ?? false;
  const jobs = data.settings?.jobs || [];
  const jobMap = {};
  jobs.forEach(j => { jobMap[j.id] = j; });
  const jobStats = {};
  for (let d = new Date(range.startDate); d <= range.endDate; d.setDate(d.getDate() + 1)) {
    const y2 = d.getFullYear();
    const m2 = String(d.getMonth() + 1).padStart(2, '0');
    const d2 = String(d.getDate()).padStart(2, '0');
    const key = `${y2}-${m2}-${d2}`;
    const rec = data.records ? data.records[key] : null;
    if (rec) {
      const dw = calcDailyWage(rec, data.settings);
      if (dw.total > 0) {
        const jid = rec.jobId || null;
        if (!jobStats[jid]) jobStats[jid] = { days: 0, income: 0 };
        jobStats[jid].days++;
        jobStats[jid].income += dw.total;
      }
    }
  }
  const jobBreakdown = Object.entries(jobStats).map(([jid, stats]) => {
    const isNullJob = jid === 'null' || !jid;
    const job = isNullJob
      ? { id: 'other', name: 'その他', color: '#999' }
      : (jobMap[jid] || { id: jid, name: '削除済み店舗', color: '#999' });
    return { job, days: stats.days, income: stats.income };
  }).sort((a, b) => b.income - a.income);
  const maxJobIncome = Math.max(...jobBreakdown.map(j => j.income), 1);

  // 年間集計（viewMode === 'year' かつ isPremium のときのみ使用）
  const yearBreakdown = isPremium && viewMode === 'year'
    ? Array.from({ length: 12 }, (_, i) => {
        const m = i + 1
        const mo = calcMonthlyTotal(year, m, data)
        return { month: m, total: mo.total, wageTotal: mo.wageTotal, backTotal: mo.backTotal }
      })
    : []
  const yearTotal = yearBreakdown.reduce((s, m) => s + m.total, 0)
  const yearWageTotal = yearBreakdown.reduce((s, m) => s + m.wageTotal, 0)
  const yearBackTotal = yearBreakdown.reduce((s, m) => s + m.backTotal, 0)
  const workMonths = yearBreakdown.filter(m => m.total > 0).length
  const avgMonthly = workMonths > 0 ? Math.round(yearTotal / workMonths) : 0
  const bestMonth = yearBreakdown.reduce((b, m) => m.total > b.total ? m : b, { month: 0, total: 0 })
  const maxMonthTotal = Math.max(...yearBreakdown.map(m => m.total), 1)

  const prevMonth = () => {
    if (viewMode === 'year') {
      setYear(y => y - 1)
      return
    }
    if (month === 1) { setMonth(12); setYear(year - 1) } else { setMonth(month - 1) }
  };
  const nextMonth = () => {
    if (viewMode === 'year') {
      setYear(y => y + 1)
      return
    }
    if (month === 12) { setMonth(1); setYear(year + 1) } else { setMonth(month + 1) }
  };

  const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  return (
    <div>
      <Header />
      <main style={{ paddingTop: '56px' }}>
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>統計</h1>
        </div>
        {isPremium && (
          <div style={{ display: 'flex', gap: '8px', padding: '0 16px 8px', justifyContent: 'center' }}>
            <button className={viewMode === 'month' ? 'tab-btn tab-btn-active' : 'tab-btn'} onClick={() => setViewMode('month')}>月</button>
            <button className={viewMode === 'year' ? 'tab-btn tab-btn-active' : 'tab-btn'} onClick={() => setViewMode('year')}>年</button>
          </div>
        )}
        <div className="dash-month-nav">
          <button className="month-nav-btn" onClick={prevMonth} aria-label="前の月">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="dash-month-info">
            <div id="dash-month-label">{viewMode === 'year' ? `${year}年` : `${year}年${month}月`}</div>
            <div id="period-label">{viewMode === 'year' ? `${year}年 年間統計` : `${fmtDate(range.startDate)} 〜 ${fmtDate(range.endDate)}`}</div>
          </div>
          <button className="month-nav-btn" onClick={nextMonth} aria-label="次の月">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {viewMode === 'month' ? (
          <>
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

            {goal > 0 && (
              <div className="section goal-progress-section">
                <div className="goal-label-row">
                  <span>目標 {formatMoney(goal)}</span>
                  <span className={isGoalAchieved ? 'goal-achieved-badge' : ''}>
                    {isGoalAchieved ? '目標達成！' : `達成 ${formatMoney(total)}（${progressPercent.toFixed(0)}%）`}
                  </span>
                </div>
                <div className="goal-progress-bar-wrap">
                  <div className={`goal-progress-bar${isGoalAchieved ? ' achieved' : ''}`} style={{ width: progressPercent + '%' }} />
                </div>
              </div>
            )}

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
              <h2 className="section-title">バック</h2>
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

            {isPremium && jobs.length > 0 && (
              <div className="section">
                <h2 className="section-title">店舗別収入</h2>
                {jobBreakdown.map(({ job, days, income }) => (
                  <div className="dash-item-row" key={job.id}>
                    <div className="dash-item-header">
                      <span className="dash-item-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: job.color, display: 'inline-block' }} />
                        {job.name}
                      </span>
                      <span className="dash-item-stats">{days}日 · {formatMoney(income)}</span>
                    </div>
                    <div className="dash-bar-bg">
                      <div className="dash-bar-fill" style={{ width: (income / maxJobIncome * 100) + '%', background: job.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="section">
              <h2 className="section-title">内訳比率</h2>
              <div className="ratio-labels">
                <span className="ratio-label-wage">時給 {wagePercent.toFixed(1)}%</span>
                {backPercent > 0 && <span className="ratio-label-back">バック {backPercent.toFixed(1)}%</span>}
              </div>
              <div className="ratio-bar-wrap-new">
                <div className="ratio-bar-wage-new" style={{ width: (backPercent === 0 ? 100 : wagePercent) + '%' }} />
                {backPercent > 0 && (
                  <div className="ratio-bar-back-new" style={{ width: backPercent + '%' }} />
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="section">
              <div className="dash-total-hero">
                <div className="dash-total-label">{year}年の合計</div>
                <div className="dash-total-value">{formatMoney(yearTotal)}</div>
              </div>
              <div className="dash-sub-cards">
                <div className="dash-sub-card">
                  <div className="dash-sub-label">時給計</div>
                  <div className="dash-sub-value">{formatMoney(yearWageTotal)}</div>
                </div>
                <div className="dash-sub-card">
                  <div className="dash-sub-label">バック計</div>
                  <div className="dash-sub-value">{formatMoney(yearBackTotal)}</div>
                </div>
                <div className="dash-sub-card">
                  <div className="dash-sub-label">稼働月数</div>
                  <div className="dash-sub-value">{workMonths}ヶ月</div>
                </div>
                <div className="dash-sub-card">
                  <div className="dash-sub-label">平均月収</div>
                  <div className="dash-sub-value">{formatMoney(avgMonthly)}</div>
                </div>
              </div>
            </div>

            <div className="section">
              <h2 className="section-title">月別収入</h2>
              {yearBreakdown.map(({ month, total }) => (
                <div className="dash-item-row" key={month}>
                  <div className="dash-item-header">
                    <span className="dash-item-name">{month}月</span>
                    <span className="dash-item-stats">{formatMoney(total)}</span>
                  </div>
                  <div className="dash-bar-bg">
                    <div className="dash-bar-fill" style={{ width: (total / maxMonthTotal * 100) + '%' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="section">
              <h2 className="section-title">年間稼働情報</h2>
              <div className="total-line">
                <span className="total-label">最高収入月</span>
                <span className="total-value">{bestMonth.month > 0 ? `${bestMonth.month}月 ${formatMoney(bestMonth.total)}` : '-'}</span>
              </div>
              <div className="total-line">
                <span className="total-label">平均月収</span>
                <span className="total-value">{formatMoney(avgMonthly)}</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
