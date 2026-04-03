import { useState } from 'react'
import { getTodayKey, getDaysInMonth } from '../lib/calc'

export function useCalendarState(weekStartDay = 0, calendarView = 'month') {
  const todayKey = getTodayKey()
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [calYear, setCalYear] = useState(() => parseInt(todayKey.split('-')[0]))
  const [calMonth, setCalMonth] = useState(() => parseInt(todayKey.split('-')[1]))

  const getWeekStartDate = (dateKey) => {
    const date = new Date(dateKey + 'T00:00:00')
    const day = date.getDay()
    const diff = (day - weekStartDay + 7) % 7
    const weekStart = new Date(date)
    weekStart.setDate(weekStart.getDate() - diff)
    return weekStart
  }

  const [weekStart, setWeekStart] = useState(() => getWeekStartDate(todayKey))

  const goToPrevWeek = () => {
    setWeekStart(prev => {
      const prevDate = new Date(prev)
      prevDate.setDate(prevDate.getDate() - 7)
      return prevDate
    })
  }
  const goToNextWeek = () => {
    setWeekStart(prev => {
      const nextDate = new Date(prev)
      nextDate.setDate(nextDate.getDate() + 7)
      return nextDate
    })
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

  const handleDateClick = (dateKey, onJobReset) => {
    setSelectedDate(dateKey)
    if (onJobReset) onJobReset()
    const [y, m] = dateKey.split('-').map(Number)
    setCalYear(y)
    setCalMonth(m)
    setWeekStart(getWeekStartDate(dateKey))
  }

  const calendarCells = []
  if (calendarView === 'month') {
    const daysInMonth = getDaysInMonth(calYear, calMonth)
    const rawFirstDay = new Date(calYear, calMonth - 1, 1).getDay()
    const firstDayOffset = (rawFirstDay - weekStartDay + 7) % 7
    for (let i = 0; i < firstDayOffset; i++) calendarCells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      calendarCells.push(dateKey)
    }
  } else {
    // 週表示の場合: weekStart から 7 日分の dateKey 文字列（nullなし）
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const y = date.getFullYear()
      const m = date.getMonth() + 1
      const d = date.getDate()
      const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      calendarCells.push(dateKey)
    }
  }

  let calLabel = ''
  if (calendarView === 'month') {
    calLabel = `${calYear}年${calMonth}月`
  } else {
    const start = new Date(weekStart)
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    const startLabel = `${start.getMonth() + 1}/${start.getDate()}`
    const endLabel = `${end.getMonth() + 1}/${end.getDate()}`
    calLabel = `${startLabel} 〜 ${endLabel}`
  }

  return { 
    todayKey, 
    selectedDate, 
    calYear, 
    calMonth, 
    calendarCells, 
    calLabel,
    goToPrevMonth, 
    goToNextMonth,
    goToPrevWeek,
    goToNextWeek,
    handleDateClick 
  }
}
