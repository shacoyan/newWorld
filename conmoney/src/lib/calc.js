```javascript
export const STORAGE_KEY = 'salary-app-v3';
export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

export function getDefaultSettings() {
  return {
    salaryType: 'hourly',
    baseSalary: 200000,
    defaultHourlyRate: 1500,
    defaultStartTime: '',
    defaultEndTime: '',
    timeStep: 1,
    payPeriodStart: 1,
    weekStartDay: 0,
    isPremium: false,
    usePremiumLogo: false,
    theme: 'default',
    items: [
      { id: 'default-drink', name: 'ドリンク', back: 0, category: 'cast' },
      { id: 'default-shot',  name: 'ショット',  back: 0, category: 'cast' },
      { id: 'default-cheki', name: 'チェキ',    back: 0, category: 'cast' },
      { id: 'default-orishan', name: 'オリシャン', back: 0, category: 'champagne' }
    ],
    jobs: [],
    monthlyGoal: 0,
    nightShiftEnabled: false
  };
}

export function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function formatDateLabel(key) {
  if (!key) return '';
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${m}/${d}(${WEEKDAYS[date.getDay()]})`;
}

export function formatDateFull(key) {
  if (!key) return '';
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${y}年${m}月${d}日(${WEEKDAYS[date.getDay()]})`;
}

export function formatMoney(amount) {
  return '¥' + amount.toLocaleString();
}

export function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function calcHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  
  if (endMins <= startMins) {
    endMins += 24 * 60;
  }
  
  const diff = endMins - startMins;
  return Math.max(0, diff / 60);
}

export function calcNightShiftHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins <= startMins) endMins += 24 * 60;

  // 深夜帯1: 22:00〜24:00 = 1320〜1440分
  const seg1Start = 22 * 60;
  const seg1End = 24 * 60;
  const ov1 = Math.max(0, Math.min(endMins, seg1End) - Math.max(startMins, seg1Start));

  // 深夜帯2: 24:00〜翌5:00 = 1440〜1740分
  const seg2Start = 24 * 60;
  const seg2End = (24 + 5) * 60;
  const ov2 = Math.max(0, Math.min(endMins, seg2End) - Math.max(startMins, seg2Start));

  return (ov1 + ov2) / 60;
}

export function calcDailyWage(record, settings) {
  let wage = 0;
  let totalHours = 0;
  
  if (settings.salaryType === 'hourly') {
    if (record.jobs && Object.keys(record.jobs).length > 0) {
      // 新フォーマット: 各jobIdをループして合計
      for (const [jobId, jobRec] of Object.entries(record.jobs)) {
        const job = settings.jobs.find(j => j.id === jobId);
        if (job && jobRec.startTime && jobRec.endTime) {
          const hours = calcHours(jobRec.startTime, jobRec.endTime);
          totalHours += hours;
          const rate = job.hourlyRate;
          const nightEnabled = job.nightShiftEnabled ?? false;
          if (nightEnabled) {
            const nightHours = calcNightShiftHours(jobRec.startTime, jobRec.endTime);
            wage += Math.round((hours - nightHours) * rate + nightHours * rate * 1.25);
          } else {
            wage += Math.round(hours * rate);
          }
        }
      }
    } else {
      // 旧フォーマット: 既存ロジック
      totalHours = calcHours(record.startTime, record.endTime);
      const job = record.jobId && (settings.jobs || []).find(j => j.id === record.jobId);
      const hourlyRate = job ? job.hourlyRate : (record.hourlyRate || settings.defaultHourlyRate || 0);
      const nightEnabled = job
        ? (job.nightShiftEnabled ?? false)
        : (settings.nightShiftEnabled ?? false);
      if (nightEnabled) {
        const nightHours = calcNightShiftHours(record.startTime, record.endTime);
        const regularHours = totalHours - nightHours;
        wage = Math.round(regularHours * hourlyRate + nightHours * hourlyRate * 1.25);
      } else {
        wage = Math.round(totalHours * hourlyRate);
      }
    }
  } else {
    const daysInMonth = getDaysInMonth(new Date().getFullYear(), new Date().getMonth() + 1);
    wage = Math.round((settings.baseSalary || 0) / daysInMonth);
  }
  
  let back = 0;
  if (record.items) {
    for (const itemId in record.items) {
      const count = record.items[itemId] || 0;
      const item = (settings.items || []).find(i => i.id === itemId);
      if (item && item.back) {
        back += item.back * count;
      }
    }
  }
  
  const avgHourlyRate = totalHours > 0 ? Math.round((wage + back) / totalHours) : 0;

  return { wage, back, total: wage + back, hours: totalHours, avgHourlyRate };
}

export function calcPeriodRange(year, month, startDay) {
  if (!startDay || startDay <= 1) {
    return {
      startDate: new Date(year, month - 1, 1),
      endDate:   new Date(year, month, 0)
    };
  }
  return {
    startDate: new Date(year, month - 2, startDay),
    endDate:   new Date(year, month - 1, startDay - 1)
  };
}

export function calcMonthlyTotal(year, month, data) {
  const startDay = (data.settings && data.settings.payPeriodStart) || 1;
  const range = calcPeriodRange(year, month, startDay);
  let wageTotal = 0, backTotal = 0;
  const d = new Date(range.startDate);
  while (d <= range.endDate) {
    const key = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    const rec = data.records && data.records[key];
    if (rec) {
      const r = calcDailyWage(rec, data.settings);
      wageTotal += r.wage;
      backTotal += r.back;
    }
    d.setDate(d.getDate() + 1);
  }
  if (data.settings && data.settings.salaryType === 'fixed') {
    return { total: Number(data.settings.baseSalary) + backTotal, wageTotal: Number(data.settings.baseSalary), backTotal };
  }
  return { total: wageTotal + backTotal, wageTotal, backTotal };
}

export function ensureRecord(data, dateKey) {
  const records = { ...data.records };
  if (!records[dateKey]) {
    records[dateKey] = {
      startTime: '',
      endTime: '',
      hourlyRate: (data.settings && data.settings.defaultHourlyRate) || 0,
      jobId: null,
      items: {},
      jobs: {}
    };
  } else {
    records[dateKey] = {
      ...records[dateKey],
      items: { ...(records[dateKey].items || {}) },
      jobs: { ...(records[dateKey].jobs || {}) }
    };
  }
  return { ...data, records };
}

export function buildMonthlyReport(year, month, data) {
  const startDay = (data.settings && data.settings.payPeriodStart) || 1;
  const range = calcPeriodRange(year, month, startDay);
  let workDays = 0;
  let totalHours = 0;
  let totalWage = 0;
  let totalBack = 0;
  let totalIncome = 0;
  const rows = [];
  const d = new Date(range.startDate);
  while (d <= range.endDate) {
    const dateKey = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    const rec = data.records && data.records[dateKey];
    if (rec && (rec.startTime || (rec.jobs && Object.keys(rec.jobs).length > 0))) {
      const r = calcDailyWage(rec, data.settings);
      workDays += 1;
      totalHours += r.hours;
      totalWage += r.wage;
      totalBack += r.back;
      totalIncome += r.total;
      rows.push({
        dateKey,
        label: formatDateLabel(dateKey),
        startTime: rec.startTime,
        endTime: rec.endTime,
        hours: r.hours,
        wage: r.wage,
        back: r.back,
        total: r.total
      });
    }
    d.setDate(d.getDate() + 1);
  }
  const avgHourlyRate = totalHours > 0 ? Math.round(totalIncome / totalHours) : 0;
  return {
    summary: {
      workDays,
      totalHours,
      totalWage,
      totalBack,
      totalIncome,
      avgHourlyRate
    },
    rows
  };
}
```
