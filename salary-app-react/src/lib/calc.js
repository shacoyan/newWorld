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
      { id: 'default-cheki', name: 'チェキ',    back: 0, category: 'cast' }
    ]
  };
}

export function getTodayKey() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function formatDateLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const w = new Date(y, m - 1, d).getDay();
  return m + '月' + d + '日(' + WEEKDAYS[w] + ')';
}

export function formatDateFull(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const w = new Date(y, m - 1, d).getDay();
  return y + '年' + m + '月' + d + '日(' + WEEKDAYS[w] + ')';
}

export function formatMoney(n) {
  return '¥' + Math.round(n).toLocaleString('ja-JP');
}

export function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function calcHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? diff / 60 : 0;
}

export function calcDailyWage(record, settings) {
  if (!record) return { wage: 0, back: 0, total: 0 };
  const hours = calcHours(record.startTime, record.endTime);
  const rate   = Number(record.hourlyRate) || 0;
  const wage   = Math.round(hours * rate);
  let   back   = 0;
  if (record.items && Array.isArray(settings.items)) {
    settings.items.forEach(function (item) {
      back += (Number(item.back) || 0) * ((record.items[item.id]) || 0);
    });
  }
  return { wage: wage, back: back, total: wage + back };
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
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const rec = data.records[key];
    if (rec) { const r = calcDailyWage(rec, data.settings); wageTotal += r.wage; backTotal += r.back; }
    d.setDate(d.getDate() + 1);
  }
  if (data.settings.salaryType === 'fixed') {
    return { total: Number(data.settings.baseSalary) + backTotal, wageTotal: Number(data.settings.baseSalary), backTotal: backTotal };
  }
  return { total: wageTotal + backTotal, wageTotal: wageTotal, backTotal: backTotal };
}

export function ensureRecord(data, dateKey) {
  const records = { ...data.records };
  if (!records[dateKey]) {
    records[dateKey] = {
      startTime: '', endTime: '',
      hourlyRate: data.settings.defaultHourlyRate || 0,
      items: {}
    };
  } else if (!records[dateKey].items) {
    records[dateKey] = { ...records[dateKey], items: {} };
  }
  return { ...data, records };
}
