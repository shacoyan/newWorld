/* ============================================================
   common.js — 共通データ管理・計算ロジック
   ============================================================ */
const STORAGE_KEY = 'salary-app-v3';
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/* ---------- ID ---------- */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

/* ---------- Default ---------- */
function getDefaultSettings() {
  return {
    salaryType: 'fixed',
    baseSalary: 200000,
    defaultHourlyRate: 1500,
    items: []
  };
}

/* ---------- localStorage ---------- */
function loadData() {
  // v1/v2 移行
  const oldRaw = localStorage.getItem('salary-app');
  if (oldRaw) {
    try {
      const old = JSON.parse(oldRaw);
      const newData = { settings: getDefaultSettings(), records: {} };
      if (old.settings) {
        if (old.settings.baseSalary != null)        newData.settings.baseSalary = Number(old.settings.baseSalary);
        if (old.settings.hourlyRate != null)         newData.settings.defaultHourlyRate = Number(old.settings.hourlyRate);
        if (old.settings.salaryType)                 newData.settings.salaryType = old.settings.salaryType;
        if (Array.isArray(old.settings.items))       newData.settings.items = old.settings.items;
      }
      if (old.records) {
        for (const [k, r] of Object.entries(old.records)) {
          newData.records[k] = {
            startTime: r.startTime || '',
            endTime:   r.endTime   || '',
            hourlyRate: Number(r.hourlyRate) || newData.settings.defaultHourlyRate,
            items: r.items || {}
          };
        }
      }
      saveData(newData);
      localStorage.removeItem('salary-app');
      return newData;
    } catch (e) { /* fall through */ }
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (!data.settings) data.settings = getDefaultSettings();
      if (!data.records)  data.records  = {};
      return data;
    } catch (e) { /* fall through */ }
  }

  return { settings: getDefaultSettings(), records: {} };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('保存失敗: localStorage の容量が不足している可能性があります。');
  }
}

function ensureRecord(data, dateKey) {
  if (!data.records[dateKey]) {
    data.records[dateKey] = {
      startTime:  '',
      endTime:    '',
      hourlyRate: data.settings.defaultHourlyRate || 0,
      items:      {}
    };
  }
  if (!data.records[dateKey].items) data.records[dateKey].items = {};
  return data.records[dateKey];
}

/* ---------- Date helpers ---------- */
function getTodayKey() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function getDaysInMonth(year, month) {
  // month: 1-indexed
  return new Date(year, month, 0).getDate();
}

function formatDateLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const w = new Date(y, m - 1, d).getDay();
  return m + '月' + d + '日(' + WEEKDAYS[w] + ')';
}

function formatDateFull(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const w = new Date(y, m - 1, d).getDay();
  return y + '年' + m + '月' + d + '日(' + WEEKDAYS[w] + ')';
}

function formatMoney(n) {
  return '¥' + Math.round(n).toLocaleString('ja-JP');
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ---------- Calculation ---------- */
function calcHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? diff / 60 : 0;
}

function calcDailyWage(record, settings) {
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

function calcMonthlyTotal(year, month, data) {
  // month: 1-indexed
  const days = getDaysInMonth(year, month);
  let wageTotal = 0, backTotal = 0;
  for (let d = 1; d <= days; d++) {
    const key = year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const rec  = data.records[key];
    if (rec) {
      const r = calcDailyWage(rec, data.settings);
      wageTotal += r.wage;
      backTotal += r.back;
    }
  }
  if (data.settings.salaryType === 'fixed') {
    return { total: Number(data.settings.baseSalary) + backTotal, wageTotal: Number(data.settings.baseSalary), backTotal: backTotal };
  }
  return { total: wageTotal + backTotal, wageTotal: wageTotal, backTotal: backTotal };
}
