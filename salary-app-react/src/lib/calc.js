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
  return amount.toLocaleString();
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
    wage = Math.round(hours * (settings.defaultHourlyRate || 0));
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

export function calcPeriodRange(payPeriodStart, targetYear, targetMonth) {
  const endDate = new Date(targetYear, targetMonth, 0);
  const startDate = new Date(targetYear, targetMonth - 1, payPeriodStart);
  return { startDate, endDate };
}

export function calcMonthlyTotal(settings, records) {
  let totalWage = 0;
  let totalBack = 0;
  let totalHours = 0;
  
  for (const key in records) {
    const record = records[key];
    const { wage, back, hours } = calcDailyWage(record, settings);
    totalWage += wage;
    totalBack += back;
    totalHours += hours;
  }
  
  return { totalWage, totalBack, totalHours, totalAll: totalWage + totalBack };
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
    records[dateKey] = { ...records[dateKey], items: records[dateKey].items || {} };
  }
  return { ...data, records };
}
