document.addEventListener('app:ready', function () {
  function persistData(data) {
    saveData(data);
    if (window.currentUser && window.saveDataAsync) {
      window.saveDataAsync(window.currentUser.uid, data);
    }
  }

  var data = window.appData || loadData();
  var todayKey = getTodayKey();
  var parts = todayKey.split('-').map(Number);
  var currentYear  = parts[0];
  var currentMonth = parts[1];

  /* DOM refs */
  var totalSalaryEl      = document.getElementById('total-salary');
  var todayLabelEl       = document.getElementById('today-label');
  var timeStartEl        = document.querySelector('.time-start');
  var timeEndEl          = document.querySelector('.time-end');
  var hourlyRateEl       = document.querySelector('.daily-hourly-rate');
  var itemRowsEl         = document.getElementById('item-rows');
  var todayWageEl        = document.getElementById('today-wage');
  var todayBackEl        = document.getElementById('today-back');
  var todayTotalEl       = document.getElementById('today-total');
  var calendarGridEl     = document.getElementById('calendar-grid');
  var calendarMonthEl    = document.getElementById('calendar-month-label');
  var prevMonthBtn       = document.getElementById('prev-month');
  var nextMonthBtn       = document.getElementById('next-month');
  var gotoSettingsBtn    = document.getElementById('goto-settings');
  var gotoDashboardBtn   = document.getElementById('goto-dashboard');

  ensureRecord(data, todayKey);
  persistData(data);
  renderAll();
  bindEvents();
  window.addEventListener('pageshow', function() { data = window.appData || loadData(); renderAll(); });

  function renderAll() { renderHeader(); renderToday(); renderCalendar(); }

  function renderHeader() {
    var m = calcMonthlyTotal(currentYear, currentMonth, data);
    totalSalaryEl.textContent = formatMoney(m.total);
  }

  function renderToday() {
    todayLabelEl.textContent = '今日: ' + formatDateLabel(todayKey);
    var rec = data.records[todayKey];
    timeStartEl.value  = rec.startTime  || '';
    timeEndEl.value    = rec.endTime    || '';
    hourlyRateEl.value = rec.hourlyRate != null ? rec.hourlyRate : (data.settings.defaultHourlyRate || '');
    renderItemRows();
    updateTodayTotals();
  }

  function renderItemRows() {
    itemRowsEl.innerHTML = '';
    if (data.settings.items.length === 0) {
      var msg = document.createElement('p');
      msg.textContent = '品目がありません。設定から追加してください。';
      msg.style.cssText = 'color:var(--text-muted);font-size:13px;text-align:center;padding:8px 0;';
      itemRowsEl.appendChild(msg);
      return;
    }
    var rec = data.records[todayKey];
    data.settings.items.forEach(function (item) {
      var count = (rec.items && rec.items[item.id]) || 0;
      var back  = (Number(item.back) || 0) * count;
      var row = document.createElement('div');
      row.className = 'item-count-row';
      row.innerHTML =
        '<span class="item-back-label">¥' + formatMoney(back).replace('¥','') + '</span>' +
        '<span class="item-name">' + escapeHtml(item.name) + '</span>' +
        '<button class="item-dec" data-id="' + item.id + '" aria-label="' + escapeHtml(item.name) + 'を減らす">−</button>' +
        '<span class="item-count-val" data-id="' + item.id + '">' + count + '</span>' +
        '<button class="item-inc" data-id="' + item.id + '" aria-label="' + escapeHtml(item.name) + 'を増やす">+</button>';
      itemRowsEl.appendChild(row);
    });
  }

  function updateTodayTotals() {
    var daily = calcDailyWage(data.records[todayKey], data.settings);
    todayWageEl.textContent  = formatMoney(daily.wage);
    todayBackEl.textContent  = formatMoney(daily.back);
    todayTotalEl.textContent = formatMoney(daily.total);
  }

  function renderCalendar() {
    calendarMonthEl.textContent = currentYear + '年' + currentMonth + '月';
    calendarGridEl.innerHTML = '';
    var firstDow  = new Date(currentYear, currentMonth - 1, 1).getDay();
    var daysInMon = getDaysInMonth(currentYear, currentMonth);
    for (var i = 0; i < firstDow; i++) {
      var empty = document.createElement('div');
      empty.className = 'day-cell empty';
      calendarGridEl.appendChild(empty);
    }
    for (var d = 1; d <= daysInMon; d++) {
      var dateKey = currentYear + '-' + String(currentMonth).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var rec     = data.records[dateKey];
      var daily   = rec ? calcDailyWage(rec, data.settings) : null;
      var dow     = new Date(currentYear, currentMonth - 1, d).getDay();
      var cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.dataset.key = dateKey;
      if (dateKey === todayKey) cell.classList.add('today');
      if (dow === 0) cell.classList.add('sunday');
      if (dow === 6) cell.classList.add('saturday');
      var dateDiv = document.createElement('div');
      dateDiv.className = 'cell-date';
      dateDiv.textContent = d;
      var totalDiv = document.createElement('div');
      totalDiv.className = 'cell-total';
      totalDiv.textContent = (daily && daily.total > 0) ? formatMoney(daily.total) : '';
      cell.appendChild(dateDiv);
      cell.appendChild(totalDiv);
      calendarGridEl.appendChild(cell);
    }
  }

  function bindEvents() {
    timeStartEl.addEventListener('change', function () {
      ensureRecord(data, todayKey).startTime = this.value;
      persistData(data); updateTodayTotals(); renderHeader();
      var cell = calendarGridEl.querySelector('[data-key="' + todayKey + '"] .cell-total');
      if (cell) { var d2 = calcDailyWage(data.records[todayKey], data.settings); cell.textContent = d2.total > 0 ? formatMoney(d2.total) : ''; }
    });
    timeEndEl.addEventListener('change', function () {
      ensureRecord(data, todayKey).endTime = this.value;
      persistData(data); updateTodayTotals(); renderHeader();
      var cell = calendarGridEl.querySelector('[data-key="' + todayKey + '"] .cell-total');
      if (cell) { var d2 = calcDailyWage(data.records[todayKey], data.settings); cell.textContent = d2.total > 0 ? formatMoney(d2.total) : ''; }
    });
    hourlyRateEl.addEventListener('change', function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 0) {
        ensureRecord(data, todayKey).hourlyRate = v;
        persistData(data); updateTodayTotals(); renderHeader();
        var cell = calendarGridEl.querySelector('[data-key="' + todayKey + '"] .cell-total');
        if (cell) { var d2 = calcDailyWage(data.records[todayKey], data.settings); cell.textContent = d2.total > 0 ? formatMoney(d2.total) : ''; }
      }
    });
    hourlyRateEl.addEventListener('blur', function () { this.value = data.records[todayKey].hourlyRate; });
    itemRowsEl.addEventListener('click', function (e) {
      var id = e.target.dataset.id;
      if (!id) return;
      var rec = ensureRecord(data, todayKey);
      var cur = rec.items[id] || 0;
      if (e.target.classList.contains('item-inc')) {
        rec.items[id] = Math.min(cur + 1, 9999);
      } else if (e.target.classList.contains('item-dec')) {
        if (cur <= 0) return;
        rec.items[id] = cur - 1;
        if (rec.items[id] === 0) delete rec.items[id];
      } else return;
      persistData(data);
      renderItemRows();
      updateTodayTotals();
      renderHeader();
      var cell = calendarGridEl.querySelector('[data-key="' + todayKey + '"] .cell-total');
      if (cell) {
        var d2 = calcDailyWage(data.records[todayKey], data.settings);
        cell.textContent = d2.total > 0 ? formatMoney(d2.total) : '';
      }
    });
    calendarGridEl.addEventListener('click', function(e) {
      var cell = e.target.closest('.day-cell');
      if (!cell || !cell.dataset.key) return;
      window.location.href = 'day.html?date=' + cell.dataset.key;
    });
    gotoSettingsBtn.addEventListener('click', function () { window.location.href = 'settings.html'; });
    gotoDashboardBtn.addEventListener('click', function () { window.location.href = 'dashboard.html'; });
    prevMonthBtn.addEventListener('click', function () {
      currentMonth--;
      if (currentMonth < 1) { currentMonth = 12; currentYear--; }
      renderHeader(); renderCalendar();
    });
    nextMonthBtn.addEventListener('click', function () {
      currentMonth++;
      if (currentMonth > 12) { currentMonth = 1; currentYear++; }
      renderHeader(); renderCalendar();
    });
  }
});
