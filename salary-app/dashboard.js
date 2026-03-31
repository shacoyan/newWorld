document.addEventListener('app:ready', function () {
  var data = window.appData || loadData();
  var todayKey = getTodayKey();
  var parts = todayKey.split('-').map(Number);
  var currentYear = parts[0];
  var currentMonth = parts[1];

  renderDashboard();
  bindEvents();

  function renderDashboard() {
    data = window.appData || loadData();

    // 月ラベル
    document.getElementById('dash-month-label').textContent = currentYear + '年' + currentMonth + '月';

    // 期間範囲
    var payPeriodStart = (data.settings && data.settings.payPeriodStart) || 1;
    var range = (typeof calcPeriodRange === 'function')
      ? calcPeriodRange(currentYear, currentMonth, payPeriodStart)
      : { startDate: new Date(currentYear, currentMonth - 1, 1), endDate: new Date(currentYear, currentMonth, 0) };

    var sd = range.startDate;
    var ed = range.endDate;

    // 期間ラベル: "M/D 〜 M/D"
    document.getElementById('period-label').textContent =
      (sd.getMonth() + 1) + '/' + sd.getDate() + ' 〜 ' +
      (ed.getMonth() + 1) + '/' + ed.getDate();

    // 月合計
    var monthly = calcMonthlyTotal(currentYear, currentMonth, data);
    var total = monthly.total || 0;
    var wageTotal = monthly.wageTotal || 0;
    var backTotal = monthly.backTotal || 0;

    document.getElementById('stat-total').textContent = formatMoney(total);
    document.getElementById('stat-wage').textContent  = formatMoney(wageTotal);
    document.getElementById('stat-back').textContent  = formatMoney(backTotal);
    document.getElementById('stat-back-ratio').textContent = total > 0 ? (backTotal / total * 100).toFixed(1) + '%' : '0.0%';

    // 期間内の全日付をループして稼働情報を集計
    var workDays = 0;
    var workTotal = 0;
    var bestDayAmount = 0;
    var bestDayKey = '';
    var itemCounts = {};

    var cur = new Date(sd);
    while (cur <= ed) {
      var key = cur.getFullYear() + '-' +
        String(cur.getMonth() + 1).padStart(2, '0') + '-' +
        String(cur.getDate()).padStart(2, '0');
      var rec = data.records && data.records[key];
      if (rec) {
        var daily = calcDailyWage(rec, data.settings);
        if (daily.total > 0) {
          workDays++;
          workTotal += daily.total;
          if (daily.total > bestDayAmount) {
            bestDayAmount = daily.total;
            bestDayKey = key;
          }
        }
        if (rec.items) {
          Object.keys(rec.items).forEach(function(id) {
            itemCounts[id] = (itemCounts[id] || 0) + (rec.items[id] || 0);
          });
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    document.getElementById('stat-work-days').textContent  = workDays + '日';
    document.getElementById('stat-avg-daily').textContent  = formatMoney(workDays > 0 ? Math.round(workTotal / workDays) : 0);
    document.getElementById('stat-best-day').textContent   = bestDayKey ? formatDateLabel(bestDayKey) + ' ' + formatMoney(bestDayAmount) : '—';

    // 品目別バック内訳
    var itemBreakdownEl = document.getElementById('item-breakdown');
    var items = (data.settings && data.settings.items) || [];
    var itemTotals = items.map(function(item) {
      var cnt = itemCounts[item.id] || 0;
      return { name: item.name, amount: cnt * (Number(item.back) || 0) };
    }).filter(function(x) { return x.amount > 0; });

    var totalItemBack = itemTotals.reduce(function(s, x) { return s + x.amount; }, 0);

    if (totalItemBack === 0) {
      itemBreakdownEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:13px;padding:8px 0;">データがありません</p>';
    } else {
      itemBreakdownEl.innerHTML = itemTotals.map(function(entry) {
        var ratio = (entry.amount / totalItemBack * 100).toFixed(1);
        return '<div class="item-breakdown-row">' +
          '<span class="breakdown-name">' + escapeHtml(entry.name) + '</span>' +
          '<div class="breakdown-bar-wrap"><div class="breakdown-bar" style="width:' + ratio + '%"></div></div>' +
          '<span class="breakdown-amount">' + formatMoney(entry.amount) + ' (' + ratio + '%)</span>' +
          '</div>';
      }).join('');
    }

    // 内訳比率バー
    var wagePercent = total > 0 ? Math.round(wageTotal / total * 100) : 50;
    var backPercent = total > 0 ? 100 - wagePercent : 50;
    var ratioWageEl = document.getElementById('ratio-bar-wage');
    var ratioBackEl = document.getElementById('ratio-bar-back');
    ratioWageEl.style.width = wagePercent + '%';
    ratioWageEl.textContent = '時給 ' + wagePercent + '%';
    ratioBackEl.style.width = backPercent + '%';
    ratioBackEl.textContent = 'バック ' + backPercent + '%';
  }

  function bindEvents() {
    document.getElementById('prev-month').addEventListener('click', function() {
      currentMonth--;
      if (currentMonth < 1) { currentMonth = 12; currentYear--; }
      renderDashboard();
    });
    document.getElementById('next-month').addEventListener('click', function() {
      currentMonth++;
      if (currentMonth > 12) { currentMonth = 1; currentYear++; }
      renderDashboard();
    });
  }
});
