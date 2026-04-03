import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { getTodayKey, ensureRecord, calcDailyWage, getDaysInMonth, WEEKDAYS } from '../lib/calc'
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
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [calYear, setCalYear] = useState(() => parseInt(todayKey.split('-')[0]))
  const [calMonth, setCalMonth] = useState(() => parseInt(todayKey.split('-')[1]))

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
  const selectedJobRec = selectedJobId
    ? (data.records[selectedDate]?.jobs?.[selectedJobId] || { startTime: '', endTime: '' })
    : null
  const displayRec = selectedJobRec || selectedRec
  const recordedJobIds = Object.keys(data.records[selectedDate]?.jobs || {})
    .filter(jid => data.records[selectedDate]?.jobs?.[jid]?.startTime)

  const daily = calcDailyWage(selectedRec, settings)

  const handleTimeChange = (field, value) => {
    const newData = ensureRecord(data, selectedDate)
    if (selectedJobId) {
      if (!newData.records[selectedDate].jobs) newData.records[selectedDate].jobs = {}
      newData.records[selectedDate].jobs[selectedJobId] = {
        ...(newData.records[selectedDate].jobs[selectedJobId] || {}),
        [field]: value
      }
    } else {
      newData.records[selectedDate][field] = value
    }
    persistData(newData)
  }

  const handleRateChange = (value) => {
    const newData = ensureRecord(data, selectedDate)
    newData.records[selectedDate].hourlyRate = parseFloat(value) || 0
    persistData(newData)
  }

  const handleJobSelect = (jobId) => {
    setSelectedJobId(prev => prev === jobId ? null : jobId)
  }

  const handleCheckin = () => {
    const job = jobs.find(j => j.id === selectedJobId)
    const fillStart = job?.defaultStartTime || defaultStartTime
    const fillEnd = job?.defaultEndTime || defaultEndTime
    if (!fillStart || !fillEnd) return
    const newData = ensureRecord(data, selectedDate)
    if (selectedJobId) {
      if (!newData.records[selectedDate].jobs) newData.records[selectedDate].jobs = {}
      newData.records[selectedDate].jobs[selectedJobId] = { startTime: fillStart, endTime: fillEnd }
    } else {
      newData.records[selectedDate].startTime = fillStart
      newData.records[selectedDate].endTime = fillEnd
    }
    persistData(newData)
  }

  const handleJobReset = () => {
    if (!selectedJobId) return
    const newData = ensureRecord(data, selectedDate)
    if (newData.records[selectedDate].jobs) {
      delete newData.records[selectedDate].jobs[selectedJobId]
    }
    persistData(newData)
  }

  const handleAllReset = () => {
    const newData = { ...data, records: { ...data.records } }
    delete newData.records[selectedDate]
    setSelectedJobId(null)
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
    setSelectedJobId(null)
    const [y, m] = dateKey.split('-').map(Number)
    setCalYear(y)
    setCalMonth(m)
  }

  const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number)
  const selWeekday = WEEKDAYS[new Date(selYear, selMonth - 1, selDay).getDay()]

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const rawFirstDay = new Date(calYear, calMonth - 1, 1).getDay()
  const firstDayOffset = (rawFirstDay - weekStartDay + 7) % 7
  const calendarCells = []
  for (let i = 0; i < firstDayOffset; i++) { calendarCells.push(null) }
  for (let d = 1; d <= daysInMonth; d++) { calendarCells.push(d) }

  return (
    <>
      <Header />
      <main style={{ paddingTop: '56px' }}>
        <div className="date-display-section">
          <div className="date-display-inner">
            <div className="date-display-main">
              <span className="date-year">{selYear}年</span>
              <span className="date-md">{selMonth}月{selDay}日</span>
              <span className="date-wd">({selWeekday})</span>
            </div>
            {selectedDate === todayKey && <span className="date-today-badge">今日</span>}
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
              const cellJobs = record?.jobs
                ? Object.keys(record.jobs).filter(jid => record.jobs[jid]?.startTime).map(jid => jobs.find(j => j.id === jid)).filter(Boolean)
                : (record?.jobId ? [jobs.find(j => j.id === record.jobId)].filter(Boolean) : [])
              let cls = 'day-cell'
              if (dayOfWeek === 0) cls += ' sunday'
              if (dayOfWeek === 6) cls += ' saturday'
              if (isToday) cls += ' today'
              if (isSelected) cls += ' selected'
              return (
                <div key={dateKey} className={cls} onClick={() => handleDateClick(dateKey)}>
                  <span className="cell-date">{day}</span>
                  {cellJobs.map(j => <span key={j.id} className="cell-job-name" style={{ backgroundColor: j.color }}>{j.name}</span>)}
                  {record && cellTotal > 0 && <AnimatedMoney amount={cellTotal} className="cell-total" />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="section work-section">
          {isPremium && jobs.length > 0 && (
            <JobSelector jobs={jobs} selectedJobId={selectedJobId} onChange={handleJobSelect} recordedJobIds={recordedJobIds} />
          )}
          {selectedJobId && selectedJobRec?.startTime && (
            <button className='btn-job-reset' onClick={handleJobReset}>この店舗の記録を消す</button>
          )}
          {!hasJobs && !defaultStartTime && (
            <div style={{ padding: '10px 14px', background: 'var(--warning-bg)', borderRadius: '10px', fontSize: '13px', color: 'var(--warning-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              ⚠ デフォルト出勤時刻が未設定です
              <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>設定する →</button>
            </div>
          )}
          { (!hasJobs || selectedJobId) && (
            <button className="btn-checkin-today" onClick={handleCheckin}>
              {selectedJobId ? (jobs.find(j=>j.id===selectedJobId)?.name || '') + 'のデフォルト出勤を登録' : 'デフォルト出勤を登録'}
            </button>
          )}
          <div className="time-input-group">
            <label>
              出勤
              <input type="time" value={displayRec.startTime} step={stepSeconds} onChange={(e) => handleTimeChange('startTime', e.target.value)} />
            </label>
            <label>
              退勤
              <input type="time" value={displayRec.endTime} step={stepSeconds} onChange={(e) => handleTimeChange('endTime', e.target.value)} />
            </label>
          </div>
          {!hasJobs && salaryType === 'hourly' && (
            <label>
              時給
              <input type="number" value={selectedRec.hourlyRate || ''} onChange={(e) => handleRateChange(e.target.value)} />
            </label>
          )}
          {(recordedJobIds.length > 0 || selectedRec.startTime) && (
            <button className="btn-day-reset" onClick={handleAllReset}>この日の記録をすべて消す</button>
          )}
        </div>

        <div className="section items-section">
          <ItemRows items={data.settings.items} record={selectedRec} onCountChange={handleItemCount} />
        </div>
      </main>
    </>
  )
}