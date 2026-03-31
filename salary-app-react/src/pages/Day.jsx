import { useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { formatDateFull, formatMoney, ensureRecord, calcDailyWage } from '../lib/calc'
import ItemRows from '../components/ItemRows'

export default function Day() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dateKey = searchParams.get('date')
  const user = useAuth()
  const { data, persistData } = useAppData(user)

  useEffect(() => {
    if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      navigate('/', { replace: true })
    }
  }, [dateKey, navigate])

  if (!data || !dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null

  const rec = data.records[dateKey] || { startTime: '', endTime: '', hourlyRate: data.settings.defaultHourlyRate || 0, items: {} }
  const step = (data.settings.timeStep || 1) === 15 ? 900 : 60
  const daily = calcDailyWage(rec, data.settings)
  const displayName = user ? (user.displayName || user.email || '') : ''

  function handleTimeChange(field, value) {
    const newData = ensureRecord(data, dateKey)
    newData.records[dateKey] = { ...newData.records[dateKey], [field]: value }
    persistData(newData)
  }

  function handleRateChange(value) {
    const v = parseInt(value, 10)
    if (!isNaN(v) && v >= 0) {
      const newData = ensureRecord(data, dateKey)
      newData.records[dateKey] = { ...newData.records[dateKey], hourlyRate: v }
      persistData(newData)
    }
  }

  function handleCheckin() {
    const start = data.settings.defaultStartTime || ''
    const end = data.settings.defaultEndTime || ''
    if (!start && !end) { alert('デフォルト出勤・退勤時刻が設定されていません。設定画面から登録してください。'); return }
    const newData = ensureRecord(data, dateKey)
    const updated = { ...newData.records[dateKey] }
    if (start) updated.startTime = start
    if (end) updated.endTime = end
    newData.records[dateKey] = updated
    persistData(newData)
  }

  function handleItemCount(itemId, newCount) {
    const newData = ensureRecord(data, dateKey)
    const items = { ...newData.records[dateKey].items }
    if (newCount <= 0) delete items[itemId]
    else items[itemId] = Math.min(newCount, 9999)
    newData.records[dateKey] = { ...newData.records[dateKey], items }
    persistData(newData)
  }

  return (
    <div id="app-content">
      <header>
        <Link to="/" className="btn-back">← 戻る</Link>
        <h1 id="day-label" className="header-title">{formatDateFull(dateKey)}</h1>
        <div className="user-chip-small">
          <span className="user-initial">{displayName ? displayName.charAt(0).toUpperCase() : '?'}</span>
          <span>{displayName}</span>
        </div>
      </header>
      <main>
        <div className="section">
          <div className="time-group">
            <span>出勤</span>
            <input type="time" className="time-start" step={step} value={rec.startTime || ''} onChange={e => handleTimeChange('startTime', e.target.value)} aria-label="出勤時刻" />
            <span>〜</span>
            <span>退勤</span>
            <input type="time" className="time-end" step={step} value={rec.endTime || ''} onChange={e => handleTimeChange('endTime', e.target.value)} aria-label="退勤時刻" />
          </div>
          <div className="time-group">
            <span>時給</span>
            <input type="number" className="daily-hourly-rate" min="0" step="1" value={rec.hourlyRate != null ? rec.hourlyRate : ''} onChange={e => handleRateChange(e.target.value)} aria-label="時給" />
            <span>円</span>
          </div>
          <button className="btn-checkin-today" onClick={handleCheckin}>出勤登録（デフォルト時刻をセット）</button>
        </div>
        <div className="section">
          <ItemRows items={data.settings.items || []} record={rec} onCountChange={handleItemCount} />
        </div>
        <div className="section">
          <div className="total-line"><span>時給分</span><span>{formatMoney(daily.wage)}</span></div>
          <div className="total-line"><span>バック</span><span>{formatMoney(daily.back)}</span></div>
          <div className="total-line grand"><span>合計</span><span className="amount">{formatMoney(daily.total)}</span></div>
        </div>
      </main>
    </div>
  )
}
