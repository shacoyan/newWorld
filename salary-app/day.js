(function () {
  var params  = new URLSearchParams(window.location.search);
  var dateKey = params.get('date');
  if (!dateKey) { window.location.href = 'index.html'; return; }

  var data = loadData();
  ensureRecord(data, dateKey);
  saveData(data);

  /* DOM refs */
  var dayLabelEl    = document.getElementById('day-label');
  var timeStartEl   = document.querySelector('.time-start');
  var timeEndEl     = document.querySelector('.time-end');
  var hourlyRateEl  = document.querySelector('.daily-hourly-rate');
  var itemRowsEl    = document.getElementById('item-rows');
  var dayWageEl     = document.getElementById('day-wage');
  var dayBackEl     = document.getElementById('day-back');
  var dayTotalEl    = document.getElementById('day-total');

  dayLabelEl.textContent = formatDateFull(dateKey);
  document.title = formatDateLabel(dateKey) + ' - 給料計算';

  renderFields();
  renderItemRows();
  updateTotals();
  bindEvents();

  function renderFields() {
    var rec = data.records[dateKey];
    timeStartEl.value  = rec.startTime  || '';
    timeEndEl.value    = rec.endTime    || '';
    hourlyRateEl.value = rec.hourlyRate != null ? rec.hourlyRate : (data.settings.defaultHourlyRate || '');
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
    var rec = data.records[dateKey];
    data.settings.items.forEach(function (item) {
      var count = (rec.items && rec.items[item.id]) || 0;
      var row = document.createElement('div');
      row.className = 'item-count-row';
      row.innerHTML =
        '<span class="item-name">' + escapeHtml(item.name) + '</span>' +
        '<button class="item-dec" data-id="' + item.id + '" aria-label="' + escapeHtml(item.name) + 'を減らす">−</button>' +
        '<span class="item-count-val" data-id="' + item.id + '">' + count + '</span>' +
        '<button class="item-inc" data-id="' + item.id + '" aria-label="' + escapeHtml(item.name) + 'を増やす">+</button>';
      itemRowsEl.appendChild(row);
    });
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
      saveData(data); updateTotals();
    });
    timeEndEl.addEventListener('change', function () {
      ensureRecord(data, dateKey).endTime = this.value;
      saveData(data); updateTotals();
    });
    hourlyRateEl.addEventListener('change', function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 0) {
        ensureRecord(data, dateKey).hourlyRate = v;
        saveData(data); updateTotals();
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
      saveData(data);
      // カウント表示を部分更新
      var countEl = itemRowsEl.querySelector('.item-count-val[data-id="' + id + '"]');
      if (countEl) countEl.textContent = rec.items[id] || 0;
      updateTotals();
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
})();
