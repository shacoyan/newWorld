import { ensureRecord } from '../lib/calc'

export function useDailyRecord(data, persistData, selectedDate, selectedJobId, settings) {
  const jobs = settings?.jobs || []
  const defaultStartTime = settings?.defaultStartTime || ''
  const defaultEndTime = settings?.defaultEndTime || ''

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

  const handleAllReset = (onJobIdReset) => {
    const newData = { ...data, records: { ...data.records } }
    delete newData.records[selectedDate]
    if (onJobIdReset) onJobIdReset()
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

  return { handleTimeChange, handleRateChange, handleCheckin, handleJobReset, handleAllReset, handleItemCount }
}

