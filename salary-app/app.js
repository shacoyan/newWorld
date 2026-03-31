(function () {
  const STORAGE_KEY = 'salary-app';
  const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
  const MAX_ACHIEVEMENT = 9999;

  let appData;
  let currentYear;
  let currentMonth; // 0-indexed

  /* ---------- Data ---------- */

  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        appData = JSON.parse(raw);
        if (!appData.settings) appData.settings = {};
        if (!appData.achievements) appData.achievements = {};
        if (typeof appData.settings.baseSalary !== 'number')
          appData.settings.baseSalary = 200000;
        if (typeof appData.settings.rewardPerAchievement !== 'number')
          appData.settings.rewardPerAchievement = 1000;
        return;
      } catch (e) { /* fall through */ }
    }
    appData = {
      settings: { baseSalary: 200000, rewardPerAchievement: 1000 },
      achievements: {}
    };
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
      console.warn('localStorage への保存に失敗しました。容量が不足している可能性があります。');
    }
  }

  /* ---------- Utility ---------- */

  function formatDateKey(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return year + '-' + m + '-' + d;
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  // タイムゾーン依存を避けるため、文字列比較で判定
  function isToday(year, month, day) {
    const now = new Date();
    const todayStr =
      now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    return formatDateKey(year, month, day) === todayStr;
  }

  function getAchievementCount(key) {
    return appData.achievements[key] || 0;
  }

  function formatNumber(n) {
    return n.toLocaleString('ja-JP');
  }

  function getAchievementClass(count) {
    if (count >= 5) return 'achievement-high';
    if (count >= 3) return 'achievement-mid';
    if (count >= 1) return 'achievement-low';
    return '';
  }

  /* ---------- Calculation ---------- */

  function calculateSalary() {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    let total = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      total += getAchievementCount(formatDateKey(currentYear, currentMonth, day));
    }
    return appData.settings.baseSalary + total * appData.settings.rewardPerAchievement;
  }

  /* ---------- Rendering ---------- */

  function updateSalaryDisplay() {
    const el = document.getElementById('total-salary');
    if (el) el.textContent = '¥' + formatNumber(calculateSalary());
  }

  function updateMonthLabel() {
    const el = document.getElementById('current-month-label');
    if (el) el.textContent = currentYear + '年' + (currentMonth + 1) + '月';
  }

  // セル1つだけを部分更新（+/-クリック時に使用）
  function updateCell(key) {
    const cell = document.querySelector('[data-key="' + key + '"]');
    if (!cell) return;

    const count = getAchievementCount(key);

    // カウント表示を更新
    const countEl = cell.querySelector('.achievement-count');
    if (countEl) {
      countEl.textContent = count;
      countEl.setAttribute('aria-label', '成果数 ' + count);
    }

    // 色クラスを更新
    cell.classList.remove('achievement-low', 'achievement-mid', 'achievement-high');
    const achClass = getAchievementClass(count);
    if (achClass) cell.classList.add(achClass);
  }

  function createDayCell(year, month, day, isCurrentMonth) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    const key = formatDateKey(year, month, day);
    cell.dataset.key = key; // 部分更新用

    if (!isCurrentMonth) {
      cell.classList.add('other-month');
    }
    if (isCurrentMonth && isToday(year, month, day)) {
      cell.classList.add('today');
    }

    const dateLabel = document.createElement('span');
    dateLabel.className = 'date-label';
    dateLabel.textContent = day;

    const count = getAchievementCount(key);
    const countEl = document.createElement('span');
    countEl.className = 'achievement-count';
    countEl.textContent = count;
    countEl.setAttribute('aria-label', '成果数 ' + count);

    const achClass = getAchievementClass(count);
    if (achClass) cell.classList.add(achClass);

    const dateStr = year + '年' + (month + 1) + '月' + day + '日';
    const btnPlus = document.createElement('button');
    btnPlus.className = 'btn-plus';
    btnPlus.textContent = '+';
    btnPlus.setAttribute('aria-label', dateStr + 'の成果を増やす');

    const btnMinus = document.createElement('button');
    btnMinus.className = 'btn-minus';
    btnMinus.textContent = '-';
    btnMinus.setAttribute('aria-label', dateStr + 'の成果を減らす');

    if (isCurrentMonth) {
      btnPlus.addEventListener('click', function () {
        const c = (appData.achievements[key] || 0);
        if (c >= MAX_ACHIEVEMENT) return; // 上限チェック
        appData.achievements[key] = c + 1;
        saveData();
        updateCell(key);       // 対象セルのみ更新
        updateSalaryDisplay(); // 合計金額のみ更新
      });
      btnMinus.addEventListener('click', function () {
        const c = appData.achievements[key] || 0;
        if (c <= 0) return;
        const next = c - 1;
        if (next === 0) {
          delete appData.achievements[key];
        } else {
          appData.achievements[key] = next;
        }
        saveData();
        updateCell(key);       // 対象セルのみ更新
        updateSalaryDisplay(); // 合計金額のみ更新
      });
    } else {
      btnPlus.disabled = true;
      btnMinus.disabled = true;
    }

    cell.appendChild(dateLabel);
    cell.appendChild(countEl);
    cell.appendChild(btnPlus);
    cell.appendChild(btnMinus);

    return cell;
  }

  function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // 曜日ヘッダー行
    DAY_LABELS.forEach(function (label) {
      const headerEl = document.createElement('div');
      headerEl.className = 'day-header';
      headerEl.textContent = label;
      grid.appendChild(headerEl);
    });

    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    // 前月の末尾セル
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) { prevMonth = 11; prevYear = currentYear - 1; }
    const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      grid.appendChild(createDayCell(prevYear, prevMonth, prevMonthDays - i, false));
    }

    // 当月セル
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    for (let day = 1; day <= daysInMonth; day++) {
      grid.appendChild(createDayCell(currentYear, currentMonth, day, true));
    }

    // 翌月の先頭セルで行を埋める
    const totalCells = firstDayOfWeek + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 11) { nextMonth = 0; nextYear = currentYear + 1; }
    for (let nd = 1; nd <= remaining; nd++) {
      grid.appendChild(createDayCell(nextYear, nextMonth, nd, false));
    }
  }

  function refresh() {
    updateMonthLabel();
    renderCalendar();
    updateSalaryDisplay();
  }

  /* ---------- Event Listeners ---------- */

  function sanitizeInput(value, max) {
    const val = parseInt(value, 10);
    if (!Number.isSafeInteger(val) || val < 0) return null;
    if (val > max) return null;
    return val;
  }

  function setupEventListeners() {
    document.getElementById('prev-month').addEventListener('click', function () {
      currentMonth -= 1;
      if (currentMonth < 0) { currentMonth = 11; currentYear -= 1; }
      refresh();
    });

    document.getElementById('next-month').addEventListener('click', function () {
      currentMonth += 1;
      if (currentMonth > 11) { currentMonth = 0; currentYear += 1; }
      refresh();
    });

    const baseSalaryInput = document.getElementById('base-salary');
    baseSalaryInput.value = appData.settings.baseSalary;
    baseSalaryInput.addEventListener('input', function () {
      const val = sanitizeInput(this.value, 100000000);
      if (val !== null) {
        appData.settings.baseSalary = val;
        saveData();
        updateSalaryDisplay();
      }
    });
    // 空欄になったら現在値に戻す
    baseSalaryInput.addEventListener('blur', function () {
      this.value = appData.settings.baseSalary;
    });

    const rewardInput = document.getElementById('reward-per-achievement');
    rewardInput.value = appData.settings.rewardPerAchievement;
    rewardInput.addEventListener('input', function () {
      const val = sanitizeInput(this.value, 1000000);
      if (val !== null) {
        appData.settings.rewardPerAchievement = val;
        saveData();
        updateSalaryDisplay();
      }
    });
    // 空欄になったら現在値に戻す
    rewardInput.addEventListener('blur', function () {
      this.value = appData.settings.rewardPerAchievement;
    });
  }

  /* ---------- Init ---------- */

  function init() {
    loadData();
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    setupEventListeners();
    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
