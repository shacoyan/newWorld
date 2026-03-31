(function () {
  var data = loadData();

  /* DOM refs */
  var radios           = document.querySelectorAll('input[name="salaryType"]');
  var baseSalaryEl     = document.getElementById('base-salary');
  var defaultRateEl    = document.getElementById('default-hourly-rate');
  var fixedSection     = document.getElementById('fixed-section');
  var hourlySection    = document.getElementById('hourly-section');
  var itemsListEl      = document.getElementById('items-list');
  var addItemBtn       = document.getElementById('add-item');

  init();

  function init() {
    // 給与タイプ
    radios.forEach(function (r) {
      r.checked = (r.value === data.settings.salaryType);
    });
    toggleSalarySection(data.settings.salaryType);
    baseSalaryEl.value  = data.settings.baseSalary;
    defaultRateEl.value = data.settings.defaultHourlyRate;
    renderItems();
    bindEvents();
  }

  function toggleSalarySection(type) {
    fixedSection.style.display  = type === 'fixed'  ? '' : 'none';
    hourlySection.style.display = type === 'hourly' ? '' : 'none';
  }

  function renderItems() {
    itemsListEl.innerHTML = '';
    data.settings.items.forEach(function (item, idx) {
      var row = document.createElement('div');
      row.className = 'item-row';

      var nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = item.name;
      nameInput.placeholder = '品目名';
      nameInput.setAttribute('aria-label', '品目名');
      nameInput.dataset.idx = idx;

      var backLabel = document.createElement('span');
      backLabel.className = 'back-label';
      backLabel.textContent = 'バック';

      var backInput = document.createElement('input');
      backInput.type = 'number';
      backInput.value = item.back;
      backInput.min = '0';
      backInput.step = '1';
      backInput.setAttribute('aria-label', 'バック単価');
      backInput.dataset.idx = idx;

      var yenLabel = document.createElement('span');
      yenLabel.className = 'back-label';
      yenLabel.textContent = '円';

      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete';
      deleteBtn.textContent = '削除';
      deleteBtn.dataset.idx = idx;
      deleteBtn.setAttribute('aria-label', item.name + 'を削除');

      row.appendChild(nameInput);
      row.appendChild(backLabel);
      row.appendChild(backInput);
      row.appendChild(yenLabel);
      row.appendChild(deleteBtn);
      itemsListEl.appendChild(row);

      nameInput.addEventListener('change', function () {
        data.settings.items[Number(this.dataset.idx)].name = this.value;
        saveData(data);
      });
      backInput.addEventListener('change', function () {
        var v = parseInt(this.value, 10);
        if (!isNaN(v) && v >= 0) {
          data.settings.items[Number(this.dataset.idx)].back = v;
          saveData(data);
        }
      });
      backInput.addEventListener('blur', function () {
        this.value = data.settings.items[Number(this.dataset.idx)].back;
      });
      deleteBtn.addEventListener('click', function () {
        var i = Number(this.dataset.idx);
        if (!confirm('"' + data.settings.items[i].name + '" を削除しますか？')) return;
        data.settings.items.splice(i, 1);
        saveData(data);
        renderItems();
      });
    });
  }

  function bindEvents() {
    radios.forEach(function (r) {
      r.addEventListener('change', function () {
        data.settings.salaryType = this.value;
        saveData(data);
        toggleSalarySection(this.value);
      });
    });

    baseSalaryEl.addEventListener('change', function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 0) { data.settings.baseSalary = v; saveData(data); }
    });
    baseSalaryEl.addEventListener('blur', function () { this.value = data.settings.baseSalary; });

    defaultRateEl.addEventListener('change', function () {
      var v = parseInt(this.value, 10);
      if (!isNaN(v) && v >= 0) { data.settings.defaultHourlyRate = v; saveData(data); }
    });
    defaultRateEl.addEventListener('blur', function () { this.value = data.settings.defaultHourlyRate; });

    addItemBtn.addEventListener('click', function () {
      data.settings.items.push({ id: generateId(), name: '新品目', back: 0 });
      saveData(data);
      renderItems();
      // 追加した品目の名前入力にフォーカス
      var inputs = itemsListEl.querySelectorAll('input[type="text"]');
      if (inputs.length > 0) inputs[inputs.length - 1].focus();
    });
  }
})();
