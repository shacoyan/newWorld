import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { getTodayKey, buildMonthlyReport, formatMoney } from '../lib/calc'
import Header from '../components/Header'

export default function Report() {
  const user = useAuth()
  const { data } = useAppData(user)
  const todayKey = getTodayKey()
  const [year, setYear] = useState(() => Number(todayKey.slice(0, 4)))
  const [month, setMonth] = useState(() => Number(todayKey.slice(5, 7)))

  if (!data) return null

  const { summary, rows } = buildMonthlyReport(year, month, data)

  const prevMonth = () => {
    let y = year
    let m = month - 1
    if (m < 1) { m = 12; y -= 1 }
    setYear(y)
    setMonth(m)
  }

  const nextMonth = () => {
    let y = year
    let m = month + 1
    if (m > 12) { m = 1; y += 1 }
    setYear(y)
    setMonth(m)
  }

  const handleCsvDownload = () => {
    const header = '日付,出勤,退勤,稼働時間,給与,バック,合計\n'
    const body = rows.map(r =>
      `${r.dateKey},${r.startTime},${r.endTime},${r.hours.toFixed(1)},${r.wage},${r.back},${r.total}`
    ).join('\n')
    const blob = new Blob(['\uFEFF' + header + body], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `konmani-${year}-${String(month).padStart(2, '0')}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">レポート</h1>
        </div>

        <div className="dash-month-nav">
          <button className="month-nav-btn" onClick={prevMonth} aria-label="前の月">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="dash-month-info">
            <div>{year}年{month}月</div>
          </div>
          <button className="month-nav-btn" onClick={nextMonth} aria-label="次の月">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="section">
          <h2 className="section-title">サマリー</h2>
          <div className="summary-grid">
            <div className="dash-sub-card">
              <div className="dash-sub-label">稼働日数</div>
              <div className="dash-sub-value">{summary.workDays}日</div>
            </div>
            <div className="dash-sub-card">
              <div className="dash-sub-label">総稼働時間</div>
              <div className="dash-sub-value">{summary.totalHours.toFixed(1)}h</div>
            </div>
            <div className="dash-sub-card">
              <div className="dash-sub-label">総収入</div>
              <div className="dash-sub-value">{formatMoney(summary.totalIncome)}</div>
            </div>
            <div className="dash-sub-card">
              <div className="dash-sub-label">平均時給</div>
              <div className="dash-sub-value">{formatMoney(summary.avgHourlyRate)}</div>
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">日別明細</h2>
          {rows.length === 0 ? (
            <div className="dash-empty">記録なし</div>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>出勤</th>
                  <th>退勤</th>
                  <th>時間</th>
                  <th>給与</th>
                  <th>バック</th>
                  <th>合計</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.dateKey}>
                    <td>{row.label}</td>
                    <td>{row.startTime}</td>
                    <td>{row.endTime}</td>
                    <td>{row.hours.toFixed(1)}h</td>
                    <td>{formatMoney(row.wage)}</td>
                    <td>{formatMoney(row.back)}</td>
                    <td>{formatMoney(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button className="btn-csv-download" onClick={handleCsvDownload}>
          CSVダウンロード
        </button>
      </main>
    </>
  )
}

