document.addEventListener('app:ready', function () {
  function persistData(data) {
    saveData(data);
    if (window.currentUser && window.saveDataAsync) {
      window.saveDataAsync(window.currentUser.uid, data);
    }
  }

  var params  = new URLSearchParams(window.location.search);
  var dateKey = params.get('date');
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) { window.location.href = 'index.html'; return; }

  var data = window.appData || loadData();
  ensureRecord(data, dateKey);
  persistData(data);

  /* DOM refs */
  var dayLabelEl    = document.getElementById('day-label');
  var timeStartEl   = document.querySelector('.time-start');
  var timeEndEl     = document.querySelector('.time-end');
  var hourlyRateEl  = document.querySelector('.daily-hourly-rate');
  var itemRowsEl    = document.getElementById('item-rows');
  var dayWageEl     = document.getElementById('day-wage');
  var dayBackEl     = document.getElementById('day-back');
  var dayTotalEl    = document.getElementById('day-total');
  var checkinBtnEl  = document.getElementById('checkin-btn');

  dayLabelEl.textContent = formatDateFull(dateKey);
  document.title = formatDateLabel(dateKey) + ' - 給料計算';

  renderFields();
  renderItemRows();
  updateTotals();
  bindEvents();

  function renderFields() {
    var rec = data.records[dateKey];
    var step = (data.settings.timeStep || 1) === 15 ? 900 : 60;
    timeStartEl.setAttribute('step', step);
    timeEndEl.setAttribute('step', step);
    timeStartEl.value  = rec.startTime  || '';
    timeEndEl.value    = rec.endTime    || '';
    hourlyRateEl.value = rec.hourlyRate != null ? rec.hourlyRate : (data.settings.defaultHourlyRate || '');
  }

  function renderItemRows() {
    itemRowsEl.innerHTML = '';
    var items = data.settings.items || [];

    if (items.length === 0) {
      var msg = document.createElement('p');
      msg.textContent = '品目がありません。設定から追加してください。';
      msg.style.cssText = 'color:var(--text-muted);font-size:13px;text-align:center;padding:8px 0;';
      itemRowsEl.appendChild(msg);
      return;
    }

    var rec       = data.records[dateKey];
    var castItems  = items.filter(function(i) { return i.category !== 'champagne'; });
    var champItems = items.filter(function(i) { return i.category === 'champagne'; });

    function makeRow(item) {
      var count = (rec.items && rec.items[item.id]) || 0;
      var back  = (Number(item.back) || 0) * count;
      var row = document.createElement('div');
      row.className = 'item-count-row';
      row.innerHTML =
        '<span class="item-back-label">' + formatMoney(back) + '</span>' +
        '<span class="item-name">' + escapeHtml(item.name) + '</span>' +
        '<button class="item-dec" data-id="' + item.id + '" aria-label="減らす">−</button>' +
        '<span class="item-count-val" data-id="' + item.id + '">' + count + '</span>' +
        '<button class="item-inc" data-id="' + item.id + '" aria-label="増やす">+</button>';
      return row;
    }

    castItems.forEach(function(item) {
      itemRowsEl.appendChild(makeRow(item));
    });

    if (champItems.length > 0) {
      var toggleBtn = document.createElement('button');
      toggleBtn.className = 'btn-champagne-toggle';
      toggleBtn.innerHTML = 'シャンパン <span>▼</span>';
      toggleBtn.dataset.open = 'true';

      var champWrap = document.createElement('div');
      champWrap.className = 'champagne-items-wrap';

      champItems.forEach(function(item) {
        champWrap.appendChild(makeRow(item));
      });

      toggleBtn.addEventListener('click', function() {
        var isOpen = this.dataset.open === 'true';
        champWrap.style.display = isOpen ? 'none' : '';
        this.dataset.open = isOpen ? 'false' : 'true';
        this.querySelector('span').textContent = isOpen ? '▶' : '▼';
      });

      itemRowsEl.appendChild(toggleBtn);
      itemRowsEl.appendChild(champWrap);
    }
  }

  function updateTotals() {
    var daily = calcDailyWage(data.records[dateKey], data.settings);
    dayWageEl.textContent  = formatMoney(daily.wage);
    dayBackEl.textContent  = formatMoney(daily.back);
    dayTotalEl.textContent = formatMoney(daily.total);
  }

  function bindEvents() {
    timeStartEl.addEventListener('change', function () {
      ensureRecord(data, dateKey).startTime = this.value;
      persistData(data); updateTotals();
    });
    timeEndEl.addEventListener('change', function () {
      ensureRecord(data, dateKey).endTime = this.value;
      persistData(data); updateTotals();
    });
    hourlyRateEl.addEventListener('change', function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 0) {
        ensureRecord(data, dateKey).hourlyRate = v;
        persistData(data); updateTotals();
      }
    });
    hourlyRateEl.addEventListener('blur', function () {
      this.value = data.records[dateKey].hourlyRate;
    });

    itemRowsEl.addEventListener('click', function (e) {
      var id = e.target.dataset.id;
      if (!id) return;
      var rec = ensureRecord(data, dateKey);
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
      updateTotals();
    });
    if (checkinBtnEl) {
      checkinBtnEl.addEventListener('click', function() {
        var start = data.settings.defaultStartTime || '';
        var end   = data.settings.defaultEndTime   || '';
        if (!start && !end) {
          alert('デフォルト出勤・退勤時刻が設定されていません。設定画面から登録してください。');
          return;
        }
        var rec = ensureRecord(data, dateKey);
        if (start) rec.startTime = start;
        if (end)   rec.endTime   = end;
        persistData(data);
        renderFields();
        updateTotals();
      });
    }
  }
});
