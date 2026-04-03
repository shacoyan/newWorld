import { useState } from 'react'
import { getTodayKey, getDaysInMonth, WEEKDAYS } from '../lib/calc'

export function useCalendarState(weekStartDay = 0) {
  const todayKey = getTodayKey()
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [calYear, setCalYear] = useState(() => parseInt(todayKey.split('-')[0]))
  const [calMonth, setCalMonth] = useState(() => parseInt(todayKey.split('-')[1]))

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
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const rawFirstDay = new Date(calYear, calMonth - 1, 1).getDay()
  const firstDayOffset = (rawFirstDay - weekStartDay + 7) % 7
  const calendarCells = []
  for (let i = 0; i < firstDayOffset; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  return { todayKey, selectedDate, calYear, calMonth, calendarCells, goToPrevMonth, goToNextMonth, handleDateClick }
}

