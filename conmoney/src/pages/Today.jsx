import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { useCalendarState } from '../hooks/useCalendarState'
import { useDailyRecord } from '../hooks/useDailyRecord'
import { calcDailyWage, calcPaydayInfo, WEEKDAYS } from '../lib/calc'
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
  const calendarView = settings.calendarView || 'month'

  const [selectedJobId, setSelectedJobId] = useState(null)

  const { todayKey, selectedDate, calYear, calMonth, calendarCells, calLabel, goToPrevMonth, goToNextMonth, goToPrevWeek, goToNextWeek, handleDateClick: calHandleDateClick } = useCalendarState(weekStartDay, calendarView)

  const { handleTimeChange, handleRateChange, handleCheckin, handleJobReset, handleAllReset, handleItemCount } = useDailyRecord(data, persistData, selectedDate, selectedJobId, settings)

  if (!data) return null

  const paydayInfo = calcPaydayInfo(data)

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

        <div className="section">
          <div className="payday-card">
            {paydayInfo.paymentType === 'daily' ? (
              <div className="payday-card-row">
                <span className="payday-card-label">本日受取額</span>
                <AnimatedMoney amount={paydayInfo.todayTotal} className="payday-card-amount" />
              </div>
            ) : (
              <>
                <div className="payday-card-row">
                  <span className="payday-card-label">今期の見込み給与</span>
                  <AnimatedMoney amount={paydayInfo.periodTotal} className="payday-card-amount" />
                </div>
                <div className="payday-card-row">
                  <span className="payday-card-label">給料日</span>
                  <span className={paydayInfo.isPayday ? 'payday-card-date payday-istoday' : 'payday-card-date'}>
                    {paydayInfo.isPayday ? '今日が給料日！' : `毎月${paydayInfo.payday}日（あと${paydayInfo.daysUntilPayday}日）`}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="section calendar-section">
          <div className="calendar-nav">
            <button onClick={calendarView === 'week' ? goToPrevWeek : goToPrevMonth} aria-label={calendarView === 'week' ? '前の週' : '前の月'}>&lt;</button>
            <span>{calLabel}</span>
            <button onClick={calendarView === 'week' ? goToNextWeek : goToNextMonth} aria-label={calendarView === 'week' ? '次の週' : '次の月'}>&gt;</button>
          </div>
          <div className="calendar-weekdays">
            {[...WEEKDAYS.slice(weekStartDay), ...WEEKDAYS.slice(0, weekStartDay)].map((wd, i) => {
              const dayIndex = (i + weekStartDay) % 7
              const cls = dayIndex === 0 ? 'sunday' : dayIndex === 6 ? 'saturday' : ''
              return <span key={i} className={cls}>{wd}</span>
            })}
          </div>
          <div className={`calendar-grid${calendarView === 'week' ? ' calendar-grid-week' : ''}`} key={calLabel}>
            {calendarCells.map((dateKey, idx) => {
              if (dateKey === null) return <div key={`empty-${idx}`} className="day-cell empty"></div>
              const [dkYear, dkMonth, dkDay] = dateKey.split('-').map(Number)
              const dayOfWeek = new Date(dkYear, dkMonth - 1, dkDay).getDay()
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
                  <span className="cell-date">{dkDay}</span>
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
          {(recordedJobIds.length > 0 || !!data.records[selectedDate]) && (
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

