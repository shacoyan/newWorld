document.addEventListener('app:ready', function () {
  function persistData(data) {
    saveData(data);
    if (window.currentUser && window.saveDataAsync) {
      window.saveDataAsync(window.currentUser.uid, data);
    }
  }

  var data = window.appData || loadData();
  var radios = document.querySelectorAll('input[name="salaryType"]');
  var baseSalaryEl = document.getElementById('base-salary');
  var defaultRateEl = document.getElementById('default-hourly-rate');
  var fixedSection = document.getElementById('fixed-section');
  var hourlySection = document.getElementById('hourly-section');
  var itemsListEl = document.getElementById('items-list');
  var addItemBtn = document.getElementById('add-item');
  var payPeriodStartEl = document.getElementById('pay-period-start');
  var defaultStartEl   = document.getElementById('default-start-time');
  var timeStepRadios   = document.querySelectorAll('input[name="timeStep"]');
  var userNameEl       = document.getElementById('user-name');
  var userInitialEl    = document.getElementById('user-initial');

  init();

  function init() {
    radios.forEach(function (r) { r.checked = (r.value === data.settings.salaryType); });
    toggleSalarySection(data.settings.salaryType);
    baseSalaryEl.value = data.settings.baseSalary;
    defaultRateEl.value = data.settings.defaultHourlyRate;
    payPeriodStartEl.value = data.settings.payPeriodStart || 1;
    // ユーザー名チップ
    var displayName = (window.currentUser && (window.currentUser.displayName || window.currentUser.email)) || '';
    if (userNameEl)    userNameEl.textContent    = displayName;
    if (userInitialEl) userInitialEl.textContent = displayName ? displayName.charAt(0).toUpperCase() : '?';

    // 出勤設定
    if (defaultStartEl) defaultStartEl.value = data.settings.defaultStartTime || '';
    timeStepRadios.forEach(function(r) {
      r.checked = (parseInt(r.value) === (data.settings.timeStep || 1));
    });
    renderItems();
    bindEvents();
  }

  function toggleSalarySection(type) {
    fixedSection.style.display = type === 'fixed' ? '' : 'none';
    hourlySection.style.display = type === 'hourly' ? '' : 'none';
  }

  function renderItems() {
    itemsListEl.innerHTML = '';
    data.settings.items.forEach(function (item, index) {
      var div = document.createElement('div');
      div.className = 'item-row';
      div.dataset.index = index;
      div.innerHTML =
        '<input type="text" class="item-name-input" value="' + escapeHtml(item.name) + '" placeholder="品目名" data-field="name">' +
        '<span class="back-label">バック</span>' +
        '<input type="number" class="item-back-input" value="' + (item.back || 0) + '" placeholder="単価" min="0" step="1" data-field="back">' +
        '<span class="back-label">円</span>' +
        '<button class="btn-delete" data-index="' + index + '" aria-label="削除">削除</button>';
      itemsListEl.appendChild(div);
    });
  }

  function bindEvents() {
    radios.forEach(function (r) {
      r.addEventListener('change', function () {
        data.settings.salaryType = this.value;
        persistData(data);
        toggleSalarySection(this.value);
      });
    });
    baseSalaryEl.addEventListener('change', function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 0) { data.settings.baseSalary = v; persistData(data); }
    });
    baseSalaryEl.addEventListener('blur', function () { this.value = data.settings.baseSalary; });
    defaultRateEl.addEventListener('change', function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 0) { data.settings.defaultHourlyRate = v; persistData(data); }
    });
    defaultRateEl.addEventListener('blur', function () { this.value = data.settings.defaultHourlyRate; });
    payPeriodStartEl.addEventListener('change', function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 1 && v <= 28) { data.settings.payPeriodStart = v; persistData(data); }
    });
    payPeriodStartEl.addEventListener('blur', function () { this.value = data.settings.payPeriodStart || 1; });
    if (defaultStartEl) {
      defaultStartEl.addEventListener('change', function() {
        data.settings.defaultStartTime = this.value;
        persistData(data);
      });
    }
    timeStepRadios.forEach(function(r) {
      r.addEventListener('change', function() {
        data.settings.timeStep = parseInt(this.value, 10);
        persistData(data);
      });
    });
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        if (window.firebaseAuth) {
          window.firebaseAuth.signOut().then(function() {
            window.location.href = 'lp.html';
          });
        }
      });
    }
    addItemBtn.addEventListener('click', function () {
      data.settings.items.push({ id: generateId(), name: '新品目', back: 0 });
      persistData(data);
      renderItems();
      var inputs = itemsListEl.querySelectorAll('.item-name-input');
      if (inputs.length) inputs[inputs.length - 1].focus();
    });
    itemsListEl.addEventListener('click', function (e) {
      if (e.target.classList.contains('btn-delete')) {
        var idx = parseInt(e.target.dataset.index, 10);
        if (!isNaN(idx) && idx >= 0 && idx < data.settings.items.length) {
          if (!confirm('"' + data.settings.items[idx].name + '" を削除しますか？')) return;
          data.settings.items.splice(idx, 1);
          persistData(data);
          renderItems();
        }
      }
    });
    itemsListEl.addEventListener('change', function (e) {
      var row = e.target.closest('.item-row');
      if (!row) return;
      var idx = parseInt(row.dataset.index, 10);
      if (isNaN(idx) || idx < 0 || idx >= data.settings.items.length) return;
      var field = e.target.dataset.field;
      if (field === 'name') {
        data.settings.items[idx].name = e.target.value;
        persistData(data);
      } else if (field === 'back') {
        var v = parseInt(e.target.value, 10);
        if (!isNaN(v) && v >= 0) { data.settings.items[idx].back = v; persistData(data); }
      }
    });
    itemsListEl.addEventListener('blur', function (e) {
      var row = e.target.closest('.item-row');
      if (!row) return;
      var idx = parseInt(row.dataset.index, 10);
      if (isNaN(idx) || idx < 0 || idx >= data.settings.items.length) return;
      if (e.target.dataset.field === 'back') {
        e.target.value = data.settings.items[idx].back;
      }
    }, true);
  }
});
