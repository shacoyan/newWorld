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
    ]
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

export function calcDailyWage(record, settings) {
  const hours = calcHours(record.startTime, record.endTime);
  let wage = 0;
  
  if (settings.salaryType === 'hourly') {
    wage = Math.round(hours * (record.hourlyRate || settings.defaultHourlyRate || 0));
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
  
  const avgHourlyRate = hours > 0 ? Math.round((wage + back) / hours) : 0;

  return { wage, back, total: wage + back, hours, avgHourlyRate };
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
      items: {}
    };
  } else {
    records[dateKey] = {
      ...records[dateKey],
      items: { ...(records[dateKey].items || {}) }
    };
  }
  return { ...data, records };
}
