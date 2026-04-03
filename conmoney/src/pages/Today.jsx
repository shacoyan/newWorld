import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { useCalendarState } from '../hooks/useCalendarState'
import { useDailyRecord } from '../hooks/useDailyRecord'
import { calcDailyWage, WEEKDAYS } from '../lib/calc'
import Header from '../components/Header'
import JobSelector from '../components/JobSelector'
import ItemRows from '../components/ItemRows'
import AnimatedMoney from '../components/AnimatedMoney'

export default function Today() {
  const user = useAuth()
  const { data, persistData } = useAppData(user)
  const navigate = useNavigate()

  const settings = data?.settings || {}
  const jobs = settings.jobs || []
  const isPremium = settings.isPremium || false
  const hasJobs = isPremium && jobs.length > 0
  const defaultStartTime = settings.defaultStartTime || ''
  const defaultHourlyRate = settings.defaultHourlyRate || 0
  const salaryType = settings.salaryType || 'hourly'
  const timeStep = settings.timeStep || 15
  const stepSeconds = timeStep === 1 ? 60 : 900
  const weekStartDay = settings.weekStartDay ?? 0

  const [selectedJobId, setSelectedJobId] = useState(null)

  const { todayKey, selectedDate, calYear, calMonth, calendarCells, goToPrevMonth, goToNextMonth, handleDateClick: calHandleDateClick } = useCalendarState(weekStartDay)

  const { handleTimeChange, handleRateChange, handleCheckin, handleJobReset, handleAllReset, handleItemCount } = useDailyRecord(data, persistData, selectedDate, selectedJobId, settings)

  if (!data) return null

  const selectedRec = data.records[selectedDate] || { startTime: '', endTime: '', hourlyRate: defaultHourlyRate, items: {} }
  const selectedJobRec = selectedJobId
    ? (data.records[selectedDate]?.jobs?.[selectedJobId] || { startTime: '', endTime: '' })
    : null
  const displayRec = selectedJobRec || selectedRec
  const recordedJobIds = Object.keys(data.records[selectedDate]?.jobs || {})
    .filter(jid => data.records[selectedDate]?.jobs?.[jid]?.startTime)

  const daily = calcDailyWage(selectedRec, settings, selectedDate)

  const handleJobSelect = (jobId) => {
    setSelectedJobId(prev => prev === jobId ? null : jobId)
  }

  const handleDateClickWrapper = (dateKey) => calHandleDateClick(dateKey, () => setSelectedJobId(null))

  const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number)
  const selWeekday = WEEKDAYS[new Date(selYear, selMonth - 1, selDay).getDay()]

  return (
    <>
      <Header />
      <main className="main-content">
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
              if (record) { const dw = calcDailyWage(data.records[dateKey], settings, dateKey); cellTotal = dw.total }
              const cellJobs = record?.jobs
                ? Object.keys(record.jobs).filter(jid => record.jobs[jid]?.startTime).map(jid => jobs.find(j => j.id === jid)).filter(Boolean)
                : (record?.jobId ? [jobs.find(j => j.id === record.jobId)].filter(Boolean) : [])
              let cls = 'day-cell'
              if (dayOfWeek === 0) cls += ' sunday'
              if (dayOfWeek === 6) cls += ' saturday'
              if (isToday) cls += ' today'
              if (isSelected) cls += ' selected'
              return (
                <div key={dateKey} className={cls} onClick={() => handleDateClickWrapper(dateKey)}>
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
            <button className="btn-day-reset" onClick={() => handleAllReset(() => setSelectedJobId(null))}>この日の記録をすべて消す</button>
          )}
        </div>

        <div className="section items-section">
          <ItemRows items={data.settings.items} record={selectedRec} onCountChange={handleItemCount} />
        </div>
      </main>
    </>
  )
}
