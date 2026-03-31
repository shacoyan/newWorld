(function () {
  const STORAGE_KEY = 'salary-app';
  const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
  const MAX_ITEM_COUNT = 9999;

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

        // v1 データ移行 (achievements -> records)
        if (appData.achievements && !appData.records) {
          appData.records = {};
          Object.keys(appData.achievements).forEach(function (key) {
            if (appData.achievements[key] > 0) {
              appData.records[key] = { startTime: '', endTime: '', items: {} };
            }
          });
          delete appData.achievements;
        }

        if (!appData.records) appData.records = {};
        if (typeof appData.settings.salaryType !== 'string') appData.settings.salaryType = 'fixed';
        if (typeof appData.settings.baseSalary !== 'number') appData.settings.baseSalary = 200000;
        if (typeof appData.settings.hourlyRate !== 'number') appData.settings.hourlyRate = 1500;
        if (!Array.isArray(appData.settings.items)) appData.settings.items = [];

        saveData();
        return;
      } catch (e) { /* fall through */ }
    }
    appData = {
      settings: {
        salaryType: 'fixed',
        baseSalary: 200000,
        hourlyRate: 1500,
        items: []
      },
      records: {}
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

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  }

  function formatDateKey(year, month, day) {
    return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function isToday(year, month, day) {
    const now = new Date();
    const todayStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    return formatDateKey(year, month, day) === todayStr;
  }

  function formatNumber(n) {
    return Math.round(n).toLocaleString('ja-JP');
  }

  function getRecord(key) {
    return appData.records[key] || { startTime: '', endTime: '', items: {} };
  }

  function ensureRecord(key) {
    if (!appData.records[key]) {
      appData.records[key] = { startTime: '', endTime: '', items: {} };
    }
    if (!appData.records[key].items) {
      appData.records[key].items = {};
    }
    return appData.records[key];
  }

  function getWorkHours(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff / 60 : 0;
  }

  function sanitizeInput(value, max) {
    const val = parseInt(value, 10);
    if (!Number.isSafeInteger(val) || val < 0 || val > max) return null;
    return val;
  }

  /* ---------- Calculation ---------- */

  function calculateSalary() {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    let total = appData.settings.salaryType === 'fixed' ? appData.settings.baseSalary : 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const key = formatDateKey(currentYear, currentMonth, day);
      const record = getRecord(key);

      if (appData.settings.salaryType === 'hourly') {
        total += getWorkHours(record.startTime, record.endTime) * appData.settings.hourlyRate;
      }

      appData.settings.items.forEach(function (item) {
        const count = (record.items && record.items[item.id]) || 0;
        total += count * item.back;
      });
    }

    return total;
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

  function updateSalaryTypeUI() {
    const fixedBlock = document.getElementById('fixed-salary-block');
    const hourlyBlock = document.getElementById('hourly-salary-block');
    if (fixedBlock) fixedBlock.style.display = appData.settings.salaryType === 'fixed' ? '' : 'none';
    if (hourlyBlock) hourlyBlock.style.display = appData.settings.salaryType === 'hourly' ? '' : 'none';
  }

  // +/- クリック時にセルの品目カウントのみ部分更新
  function updateCellItemCount(key, itemId) {
    const cell = document.querySelector('[data-key="' + key + '"]');
    if (!cell) return;
    const row = cell.querySelector('.item-count-row[data-item-id="' + itemId + '"]');
    if (!row) return;
    const countEl = row.querySelector('.item-count');
    if (!countEl) return;
    const record = getRecord(key);
    const count = (record.items && record.items[itemId]) || 0;
    countEl.textContent = count;
    countEl.setAttribute('aria-label', '件数 ' + count);
    // 合計カウントに応じてセルの色クラスを更新
    updateCellAchievementClass(cell, key);
  }

  // 品目合計カウントに応じてセルの色クラスを更新
  function updateCellAchievementClass(cell, key) {
    const record = getRecord(key);
    let total = 0;
    appData.settings.items.forEach(function (item) {
      total += (record.items && record.items[item.id]) || 0;
    });
    cell.classList.remove('achievement-low', 'achievement-mid', 'achievement-high');
    if (total >= 5) cell.classList.add('achievement-high');
    else if (total >= 3) cell.classList.add('achievement-mid');
    else if (total >= 1) cell.classList.add('achievement-low');
  }

  // 品目名変更時: カレンダー内の品目名テキストのみ部分更新
  function updateItemNamesInCalendar(itemId, newName) {
    document.querySelectorAll('.item-count-row[data-item-id="' + itemId + '"] .item-count-name')
      .forEach(function (el) { el.textContent = newName; el.title = newName; });
  }

  function createDayCell(year, month, day, isCurrentMonth) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    const key = formatDateKey(year, month, day);
    cell.dataset.key = key;

    if (!isCurrentMonth) cell.classList.add('other-month');
    if (isCurrentMonth && isToday(year, month, day)) cell.classList.add('today');
    if (isCurrentMonth) updateCellAchievementClass(cell, key);

    // 日付
    const dateLabel = document.createElement('span');
    dateLabel.className = 'date-label';
    dateLabel.textContent = day;
    cell.appendChild(dateLabel);

    const record = getRecord(key);

    // 時給モード: 出退勤時刻
    if (appData.settings.salaryType === 'hourly') {
      const timeRow = document.createElement('div');
      timeRow.className = 'time-row';

      const startInput = document.createElement('input');
      startInput.type = 'time';
      startInput.className = 'time-start';
      startInput.value = record.startTime || '';
      startInput.disabled = !isCurrentMonth;
      startInput.setAttribute('aria-label', year + '年' + (month + 1) + '月' + day + '日 出勤時刻');

      const sep = document.createElement('span');
      sep.textContent = '〜';
      sep.style.fontSize = '0.6rem';

      const endInput = document.createElement('input');
      endInput.type = 'time';
      endInput.className = 'time-end';
      endInput.value = record.endTime || '';
      endInput.disabled = !isCurrentMonth;
      endInput.setAttribute('aria-label', year + '年' + (month + 1) + '月' + day + '日 退勤時刻');

      if (isCurrentMonth) {
        startInput.addEventListener('change', function () {
          ensureRecord(key).startTime = this.value;
          saveData();
          updateSalaryDisplay();
        });
        endInput.addEventListener('change', function () {
          ensureRecord(key).endTime = this.value;
          saveData();
          updateSalaryDisplay();
        });
      }

      timeRow.appendChild(startInput);
      timeRow.appendChild(sep);
      timeRow.appendChild(endInput);
      cell.appendChild(timeRow);
    }

    // 品目カウント行
    appData.settings.items.forEach(function (item) {
      const row = document.createElement('div');
      row.className = 'item-count-row';
      row.dataset.itemId = item.id;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'item-count-name';
      nameSpan.textContent = item.name;
      nameSpan.title = item.name;

      const count = (record.items && record.items[item.id]) || 0;
      const countSpan = document.createElement('span');
      countSpan.className = 'item-count';
      countSpan.textContent = count;
      countSpan.setAttribute('aria-label', '件数 ' + count);

      const btnMinus = document.createElement('button');
      btnMinus.className = 'btn-minus';
      btnMinus.textContent = '-';
      btnMinus.disabled = !isCurrentMonth;
      btnMinus.setAttribute('aria-label', item.name + 'を減らす');

      const btnPlus = document.createElement('button');
      btnPlus.className = 'btn-plus';
      btnPlus.textContent = '+';
      btnPlus.disabled = !isCurrentMonth;
      btnPlus.setAttribute('aria-label', item.name + 'を増やす');

      if (isCurrentMonth) {
        btnMinus.addEventListener('click', function () {
          const rec = ensureRecord(key);
          const c = rec.items[item.id] || 0;
          if (c <= 0) return;
          const next = c - 1;
          if (next === 0) delete rec.items[item.id];
          else rec.items[item.id] = next;
          saveData();
          updateCellItemCount(key, item.id);
          updateSalaryDisplay();
        });
        btnPlus.addEventListener('click', function () {
          const rec = ensureRecord(key);
          const c = rec.items[item.id] || 0;
          if (c >= MAX_ITEM_COUNT) return;
          rec.items[item.id] = c + 1;
          saveData();
          updateCellItemCount(key, item.id);
          updateSalaryDisplay();
        });
      }

      row.appendChild(nameSpan);
      row.appendChild(btnMinus);
      row.appendChild(countSpan);
      row.appendChild(btnPlus);
      cell.appendChild(row);
    });

    return cell;
  }

  function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';

    DAY_LABELS.forEach(function (label) {
      const h = document.createElement('div');
      h.className = 'day-header';
      h.textContent = label;
      grid.appendChild(h);
    });

    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    let prevMonth = currentMonth - 1, prevYear = currentYear;
    if (prevMonth < 0) { prevMonth = 11; prevYear--; }
    const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      grid.appendChild(createDayCell(prevYear, prevMonth, prevMonthDays - i, false));
    }

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    for (let d = 1; d <= daysInMonth; d++) {
      grid.appendChild(createDayCell(currentYear, currentMonth, d, true));
    }

    const totalCells = firstDayOfWeek + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    let nextMonth = currentMonth + 1, nextYear = currentYear;
    if (nextMonth > 11) { nextMonth = 0; nextYear++; }
    for (let nd = 1; nd <= remaining; nd++) {
      grid.appendChild(createDayCell(nextYear, nextMonth, nd, false));
    }
  }

  function renderItemsList() {
    const list = document.getElementById('items-list');
    if (!list) return;
    list.innerHTML = '';

    appData.settings.items.forEach(function (item) {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.dataset.id = item.id;

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'item-name';
      nameInput.value = item.name;
      nameInput.placeholder = '品目名';
      nameInput.setAttribute('aria-label', '品目名');
      nameInput.addEventListener('input', function () {
        item.name = this.value;
        saveData();
        // カレンダー全再描画せず品目名テキストのみ部分更新（フォーカス維持）
        updateItemNamesInCalendar(item.id, this.value);
        updateSalaryDisplay();
      });

      const backLabel = document.createElement('span');
      backLabel.textContent = 'バック';
      backLabel.style.cssText = 'font-size:0.75rem;color:var(--color-text-secondary);white-space:nowrap;';

      const backInput = document.createElement('input');
      backInput.type = 'number';
      backInput.className = 'item-back';
      backInput.value = item.back;
      backInput.min = '0';
      backInput.step = '1';
      backInput.setAttribute('aria-label', item.name + ' バック単価');
      backInput.addEventListener('input', function () {
        const val = sanitizeInput(this.value, 10000000);
        if (val !== null) { item.back = val; saveData(); updateSalaryDisplay(); }
      });
      backInput.addEventListener('blur', function () { this.value = item.back; });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'item-delete';
      deleteBtn.textContent = '削除';
      deleteBtn.setAttribute('aria-label', item.name + 'を削除');
      deleteBtn.addEventListener('click', function () {
        if (!confirm('"' + item.name + '" を削除してもよいですか？')) return;
        appData.settings.items = appData.settings.items.filter(function (i) { return i.id !== item.id; });
        saveData();
        renderItemsList();
        renderCalendar();
        updateSalaryDisplay();
      });

      row.appendChild(nameInput);
      row.appendChild(backLabel);
      row.appendChild(backInput);
      row.appendChild(deleteBtn);
      list.appendChild(row);
    });
  }

  function refresh() {
    updateMonthLabel();
    updateSalaryTypeUI();
    renderItemsList();
    renderCalendar();
    updateSalaryDisplay();
  }

  /* ---------- Event Listeners ---------- */

  function setupEventListeners() {
    document.getElementById('prev-month').addEventListener('click', function () {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      refresh();
    });

    document.getElementById('next-month').addEventListener('click', function () {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      refresh();
    });

    // 給与タイプ切り替え
    document.querySelectorAll('input[name="salary-type"]').forEach(function (radio) {
      if (radio.value === appData.settings.salaryType) radio.checked = true;
      radio.addEventListener('change', function () {
        appData.settings.salaryType = this.value;
        saveData();
        updateSalaryTypeUI();
        renderCalendar();
        updateSalaryDisplay();
      });
    });

    // 固定給
    const baseSalaryInput = document.getElementById('base-salary');
    if (baseSalaryInput) {
      baseSalaryInput.value = appData.settings.baseSalary;
      baseSalaryInput.addEventListener('input', function () {
        const val = sanitizeInput(this.value, 100000000);
        if (val !== null) { appData.settings.baseSalary = val; saveData(); updateSalaryDisplay(); }
      });
      baseSalaryInput.addEventListener('blur', function () { this.value = appData.settings.baseSalary; });
    }

    // 時給
    const hourlyRateInput = document.getElementById('hourly-rate');
    if (hourlyRateInput) {
      hourlyRateInput.value = appData.settings.hourlyRate;
      hourlyRateInput.addEventListener('input', function () {
        const val = sanitizeInput(this.value, 1000000);
        if (val !== null) { appData.settings.hourlyRate = val; saveData(); updateSalaryDisplay(); }
      });
      hourlyRateInput.addEventListener('blur', function () { this.value = appData.settings.hourlyRate; });
    }

    // 品目追加
    document.getElementById('add-item').addEventListener('click', function () {
      appData.settings.items.push({ id: generateId(), name: '新品目', back: 0 });
      saveData();
      renderItemsList();
      renderCalendar();
      updateSalaryDisplay();
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
