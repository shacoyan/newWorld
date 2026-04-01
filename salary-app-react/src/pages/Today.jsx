import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { getTodayKey, formatDateFull, formatMoney, ensureRecord, calcDailyWage, getDaysInMonth, WEEKDAYS } from '../lib/calc'
import Header from '../components/Header'
import JobSelector from '../components/JobSelector'
import ItemRows from '../components/ItemRows'
import AnimatedMoney from '../components/AnimatedMoney'

export default function Today() {
  const user = useAuth()
  const { data, persistData } = useAppData(user)
  const navigate = useNavigate()

  const todayKey = getTodayKey()
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [calYear, setCalYear] = useState(() => parseInt(selectedDate.split('-')[0]))
  const [calMonth, setCalMonth] = useState(() => parseInt(selectedDate.split('-')[1]))
  const [selectedJobId, setSelectedJobId] = useState(null)

  if (!data) return null

  const settings = data.settings || {}
  const jobs = settings.jobs || []
  const isPremium = settings.isPremium || false
  const hasJobs = isPremium && jobs.length > 0
  const defaultStartTime = settings.defaultStartTime || ''
  const defaultEndTime = settings.defaultEndTime || ''
  const defaultHourlyRate = settings.defaultHourlyRate || 0
  const salaryType = settings.salaryType || 'hourly'
  const timeStep = settings.timeStep || 15
  const stepSeconds = timeStep === 1 ? 60 : 900
  const weekStartDay = settings.weekStartDay ?? 0

  const selectedRec = data.records[selectedDate] || { startTime: '', endTime: '', hourlyRate: defaultHourlyRate, items: {} }
  const daily = calcDailyWage(selectedRec, settings)

  const handleTimeChange = (field, value) => {
    const newData = ensureRecord(data, selectedDate)
    newData.records[selectedDate][field] = value
    if (selectedJobId) {
      newData.records[selectedDate].jobId = selectedJobId
    }
    persistData(newData)
  }

  const handleRateChange = (value) => {
    const newData = ensureRecord(data, selectedDate)
    newData.records[selectedDate].hourlyRate = parseFloat(value) || 0
    persistData(newData)
  }

  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId)
    const selectedJob = jobs.find(j => j.id === jobId)
    const newData = ensureRecord(data, selectedDate)
    newData.records[selectedDate].jobId = jobId
    if (selectedJob?.defaultStartTime) newData.records[selectedDate].startTime = selectedJob.defaultStartTime
    if (selectedJob?.defaultEndTime) newData.records[selectedDate].endTime = selectedJob.defaultEndTime
    persistData(newData)
  }

  const handleCheckin = () => {
    if (!defaultStartTime || !defaultEndTime) return
    const newData = ensureRecord(data, selectedDate)
    newData.records[selectedDate].startTime = defaultStartTime
    newData.records[selectedDate].endTime = defaultEndTime
    newData.records[selectedDate].jobId = selectedJobId
    persistData(newData)
  }

  const handleItemCount = (itemId, newCount) => {
    const newData = ensureRecord(data, selectedDate)
    if (newCount <= 0) {
      delete newData.records[selectedDate].items[itemId]
    } else {
      newData.records[selectedDate].items[itemId] = newCount
    }
    persistData(newData)
  }

  const goToPrevMonth = () => {
    let m = calMonth - 1
    let y = calYear
    if (m < 1) { m = 12; y-- }
    setCalMonth(m)
    setCalYear(y)
  }

  const goToNextMonth = () => {
    let m = calMonth + 1
    let y = calYear
    if (m > 12) { m = 1; y++ }
    setCalMonth(m)
    setCalYear(y)
  }

  const handleDateClick = (dateKey) => {
    setSelectedDate(dateKey)
    const [y, m] = dateKey.split('-').map(Number)
    setCalYear(y)
    setCalMonth(m)
    const rec = data.records[dateKey]
    setSelectedJobId(rec?.jobId || null)
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const rawFirstDay = new Date(calYear, calMonth - 1, 1).getDay()
  const firstDayOffset = (rawFirstDay - weekStartDay + 7) % 7
  const calendarCells = []
  for (let i = 0; i < firstDayOffset; i++) { calendarCells.push(null) }
  for (let d = 1; d <= daysInMonth; d++) { calendarCells.push(d) }

  return (
    <>
      <Header type="main" />
      <main style={{ paddingTop: '56px' }}>
        <div className="date-display-section">
          <h1>{formatDateFull(selectedDate)}{selectedDate === todayKey && ' (今日)'}</h1>
        </div>

        <div className="section calendar-section">
          <div className="calendar-nav">
            <button onClick={goToPrevMonth} aria-label="前の月">&lt;</button>
            <span>{calYear}年{calMonth}月</span>
            <button onClick={goToNextMonth} aria-label="次の月">&gt;</button>
          </div>
          <div className="calendar-weekdays">
            {[...WEEKDAYS.slice(weekStartDay), ...WEEKDAYS.slice(0, weekStartDay)].map((wd, i) => {
              const dayIndex = (i + weekStartDay) % 7
              const cls = dayIndex === 0 ? 'sunday' : dayIndex === 6 ? 'saturday' : ''
              return <span key={i} className={cls}>{wd}</span>
            })}
          </div>
          <div className="calendar-grid" key={`${calYear}-${calMonth}`}>
            {calendarCells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="day-cell empty"></div>
              const dateKey = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const dayOfWeek = new Date(calYear, calMonth - 1, day).getDay()
              const isSelected = dateKey === selectedDate
              const isToday = dateKey === todayKey
              const record = data.records[dateKey]
              let cellTotal = 0
              if (record) { const dw = calcDailyWage(data.records[dateKey], settings); cellTotal = dw.total }
              let cls = 'day-cell'
              if (dayOfWeek === 0) cls += ' sunday'
              if (dayOfWeek === 6) cls += ' saturday'
              if (isToday) cls += ' today'
              if (isSelected) cls += ' selected'
              return (
                <div key={dateKey} className={cls} onClick={() => handleDateClick(dateKey)}>
                  <span className="cell-date">{day}</span>
                  {record && cellTotal > 0 && <AnimatedMoney amount={cellTotal} className="cell-total" />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="section summary-section">
          <p className="summary-label">{selectedDate === todayKey ? '本日の合計' : 'この日の合計'}</p>
          <div className="summary-total"><AnimatedMoney amount={daily.total} /></div>
          <div className="summary-breakdown">
            <div className="summary-card">
              <span className="summary-card-label">時給分</span>
              <AnimatedMoney amount={daily.wage} className="summary-card-value" />
            </div>
            <div className="summary-card">
              <span className="summary-card-label">バック</span>
              <AnimatedMoney amount={daily.back} className="summary-card-value" />
            </div>
          </div>
          {daily.hours > 0 && (
            <div className="summary-sub">
              平均時給 <AnimatedMoney amount={daily.avgHourlyRate} />/h · {daily.hours.toFixed(1)}h稼働
            </div>
          )}
        </div>

        <div className="section items-section">
          <ItemRows items={data.settings.items} record={selectedRec} onCountChange={handleItemCount} />
        </div>

        <div className="section work-section">
          {isPremium && jobs.length > 0 && (
            <JobSelector jobs={jobs} selectedJobId={selectedJobId} onChange={handleJobSelect} />
          )}
          {!hasJobs && !defaultStartTime && (
            <div style={{ padding: '10px 14px', background: 'var(--warning-bg)', borderRadius: '10px', fontSize: '13px', color: 'var(--warning-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              ⚠ デフォルト出勤時刻が未設定です
              <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>設定する →</button>
            </div>
          )}
          {!hasJobs && <button className="btn-checkin-today" onClick={handleCheckin}>デフォルト出勤を登録</button>}
          <div className="time-input-group">
            <label>
              出勤
              <input type="time" value={selectedRec.startTime} step={stepSeconds} onChange={(e) => handleTimeChange('startTime', e.target.value)} />
            </label>
            <label>
              退勤
              <input type="time" value={selectedRec.endTime} step={stepSeconds} onChange={(e) => handleTimeChange('endTime', e.target.value)} />
            </label>
          </div>
          {!hasJobs && salaryType === 'hourly' && (
            <label>
              時給
              <input type="number" value={selectedRec.hourlyRate || ''} onChange={(e) => handleRateChange(e.target.value)} />
            </label>
          )}
        </div>
      </main>
    </>
  )
}
