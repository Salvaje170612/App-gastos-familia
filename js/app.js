let expenses = [];
let budgets = {};
let expenseChart = null;
let selectedDate = new Date();
let tapCount = 0;
let tapTimer = null;
let currentTheme = 'default';
let tendenciaChart = null;

const DOG_IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCQnPemOzgDaAc+tNB7kgAdSegqGbULaND9+ZsdF+Vfz6/pSNVFy2RJERcNhSAw6g9qnkt42h5mjXBHzNxz6VlJdSOGaGRYzkHIXnH+NE2oyGbJYFT/AA7QwP1qdWJ6F+VMSMN2SDioXGDjNaLWs13D9rQKqlQcHg8cVSlhkQ/MpAPQ44NMRBiinbKKAL2r6ddzBEs4f3CDJGQCT6n1rn5LG7UnMLcda668jimI8xnJ7AMf5ViJdLILiJyQ8bdxgj049O1IupVlShexVi0WZrYT7mRj1AHIqewjOn3YdpEfb1AGDz70Xl5cWsguIGYxMfmH8J9Qfeo4LiUzNdQRhdvIB5//AF0IhSc4qT6m99umu12W4VyBufJ6c+lWrO4SWNo3VSO46iufkfZLvMYJf5iegPsMVuWSwiHdHgBuTz09qYic6bZk58o8+jGirAYkA8/lRSuBkzBhN8wOCKwtZgktrpb2Lo3BPv7/AFrqZkjuVAcdOmDjFQSaUkqkedIVP8JOR+tCRtOSlGzRz4RL21E6DaQDmNgdue+KoxmSEfu3K8/cNdW2mRhQp5I5GTxVebRRcYBwvsq4zQlYwhzRjYbpdrDdpvlLGM8ANwM96v29msBYRt8vp7VLY2ItIBGvTOcelWgg9abl2GR7fYfkaKlwo/yaKkDDsnZolLMScnkmtWI8D60UVZp0JMZxmpUGE44ooqWTIaeg/Gk/goooIIT1NFFFMR//2Q==';

function getUser() {
  return window.currentUser || null;
}

function getSeasonalTheme(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 4 && day <= 14) return 'easter';
  if (month === 10) return 'halloween';
  if (month === 12) return 'christmas';
  return 'default';
}

function getEmojisForTheme(theme) {
  if (theme === 'easter') return ['🐣', '🥚', '🐰', '🌸', '🌷', '🦋', '🐥'];
  if (theme === 'halloween') return ['👻', '🧟', '🧙‍♀️', '🦇', '💀', '🕷️', '🎃'];
  if (theme === 'christmas') return ['🎄', '⛄', '🎅', '❄️', '🦌', '🎁', '⭐'];
  return ['💵', '💴', '💶', '💷', '💰', '🤑', '💸'];
}

function getGreetingForTheme(theme) {
  if (theme === 'easter') return '🐣 ¡Felices Pascuas! 🌸';
  if (theme === 'halloween') return '👻 ¡Feliz Halloween! 🎃';
  if (theme === 'christmas') return '🎄 ¡Feliz Navidad! ⛄';
  return null;
}

function applyTheme(theme) {
  currentTheme = theme;
  const header = document.querySelector('.header');
  const body = document.body;
  body.classList.remove('theme-easter', 'theme-halloween', 'theme-christmas');
  const oldStyle = document.getElementById('themeStyle');
  if (oldStyle) oldStyle.remove();
  const oldChick = document.getElementById('easterChick');
  if (oldChick) oldChick.remove();
  const oldGreeting = document.getElementById('seasonGreeting');
  if (oldGreeting) oldGreeting.remove();

  const style = document.createElement('style');
  style.id = 'themeStyle';

  const greeting = getGreetingForTheme(theme);
  if (greeting) {
    const banner = document.createElement('div');
    banner.id = 'seasonGreeting';
    banner.textContent = greeting;
    banner.style.cssText = 'text-align:center;padding:8px;font-size:16px;font-weight:700;letter-spacing:1px;';
    if (theme === 'easter') { banner.style.background = 'linear-gradient(135deg,#fce7f3,#ede9fe)'; banner.style.color = '#9d174d'; }
    if (theme === 'halloween') { banner.style.background = '#f97316'; banner.style.color = 'white'; }
    if (theme === 'christmas') { banner.style.background = 'linear-gradient(135deg,#166534,#dc2626)'; banner.style.color = 'white'; }
    document.body.insertBefore(banner, document.body.firstChild);
  }

  if (theme === 'easter') {
    body.classList.add('theme-easter');
    if (header) header.style.background = 'linear-gradient(135deg, #f9a8d4 0%, #a78bfa 100%)';
    document.body.style.background = 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)';
    document.title = '🐣 Control Gastos Familia';
    style.textContent = `
      .btn-primary{background:linear-gradient(135deg,#f9a8d4 0%,#a78bfa 100%)!important;}
      .tab.active{border-color:#f9a8d4!important;color:#9d174d!important;background:#fce7f3!important;}
      .section-title{color:#9d174d!important;}
      .progress-fill{background:linear-gradient(90deg,#f9a8d4,#a78bfa)!important;}
      #easterChick{position:fixed;top:10px;right:10px;font-size:40px;z-index:1000;animation:wobble 1s infinite;}
      @keyframes wobble{0%,100%{transform:rotate(-5deg);}50%{transform:rotate(5deg);}}
    `;
    const chick = document.createElement('div');
    chick.id = 'easterChick';
    chick.textContent = '🐣';
    document.body.appendChild(chick);
  } else if (theme === 'halloween') {
    body.classList.add('theme-halloween');
    if (header) header.style.background = 'repeating-linear-gradient(45deg,#f97316,#f97316 20px,#1c1917 20px,#1c1917 40px)';
    document.body.style.background = 'repeating-linear-gradient(45deg,#1c1917,#1c1917 20px,#292524 20px,#292524 40px)';
    document.title = '👻 Control Gastos Familia';
    style.textContent = `
      .app-container{background:#1c1917!important;}
      .summary-card{background:#292524!important;border:2px solid #f97316;color:white;}
      .summary-label{color:#fdba74!important;}
      .summary-value{color:#f97316!important;}
      .summary-value.positive{color:#4ade80!important;}
      .summary-value.negative{color:#f97316!important;}
      .btn-primary{background:linear-gradient(135deg,#92400e 0%,#f97316 100%)!important;}
      .add-expense-section{background:#292524!important;color:white;}
      .expenses-section{background:#292524!important;color:white;}
      .section-title{color:#f97316!important;}
      .tab{background:#1c1917!important;color:#fdba74!important;border-color:#f97316!important;}
      .tab.active{background:#f97316!important;color:white!important;}
      .input-group input,.input-group select{background:#1c1917!important;color:white!important;border-color:#f97316!important;}
      .expense-item{background:#1c1917!important;border-color:#f97316!important;}
      .expense-name{color:white!important;}
      .expense-meta{color:#fdba74!important;}
      .progress-fill{background:linear-gradient(90deg,#92400e,#f97316)!important;}
      .progress-bar{background:#292524!important;}
    `;
  } else if (theme === 'christmas') {
    body.classList.add('theme-christmas');
    if (header) header.style.background = 'linear-gradient(135deg,#166534 0%,#dc2626 100%)';
    document.body.style.background = 'linear-gradient(135deg,#14532d 0%,#991b1b 100%)';
    document.title = '🎄 Control Gastos Familia';
    style.textContent = `
      .btn-primary{background:linear-gradient(135deg,#166534 0%,#dc2626 100%)!important;}
      .section-title{color:#166534!important;}
      .tab.active{border-color:#dc2626!important;color:#dc2626!important;}
      .progress-fill{background:linear-gradient(90deg,#166534,#dc2626)!important;}
    `;
  } else {
    if (header) header.style.background = '';
    document.body.style.background = '';
    document.title = '💰 Control Gastos Familia';
  }
  document.head.appendChild(style);
}

function secretThemeTester() {
  tapCount++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => { tapCount = 0; }, 1000);
  if (tapCount >= 5) {
    tapCount = 0;
    const theme = prompt('🎨 Selecciona tema:\n1 = Default\n2 = Easter 🐣\n3 = Halloween 👻\n4 = Christmas 🎄');
    const themes = { '1': 'default', '2': 'easter', '3': 'halloween', '4': 'christmas' };
    if (themes[theme]) applyTheme(themes[theme]);
  }
}

function moneyRain() {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);

  if (!document.getElementById('moneyRainStyle')) {
    const style = document.createElement('style');
    style.id = 'moneyRainStyle';
    style.textContent = '@keyframes fall{0%{transform:translateY(0) rotate(0deg);opacity:1;}100%{transform:translateY(100vh) rotate(720deg);opacity:0;}}';
    document.head.appendChild(style);
  }

  if (currentTheme === 'christmas') {
    for (let i = 0; i < 20; i++) {
      const dog = document.createElement('img');
      dog.src = DOG_IMAGE;
      const size = Math.random() * 40 + 40;
      dog.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;border:3px solid #dc2626;left:${Math.random()*100}%;top:-80px;animation:fall ${Math.random()*2+1.5}s linear forwards;animation-delay:${Math.random()*2}s;object-fit:cover;`;
      container.appendChild(dog);
    }
  } else {
    const emojis = getEmojisForTheme(currentTheme);
    for (let i = 0; i < 30; i++) {
      const bill = document.createElement('div');
      bill.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      bill.style.cssText = `position:absolute;font-size:${Math.random()*20+20}px;left:${Math.random()*100}%;top:-50px;animation:fall ${Math.random()*2+1}s linear forwards;animation-delay:${Math.random()*1.5}s;`;
      container.appendChild(bill);
    }
  }

  setTimeout(() => { if (document.body.contains(container)) document.body.removeChild(container); }, 3000);
}

async function initApp() {
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const savedBudget = localStorage.getItem('monthlyBudget');
  if (savedBudget) CONFIG.MONTHLY_INCOME = parseFloat(savedBudget);
  applyTheme(getSeasonalTheme());
  const header = document.querySelector('.header h1');
  if (header) header.addEventListener('click', secretThemeTester);
  updateMonthLabel();
  setupTabs();
  await initAuth();
}

function updateMonthLabel() {
  document.getElementById('selectedMonth').textContent = selectedDate.toLocaleDateString('es-MX', {
    month: 'long', year: 'numeric'
  }).replace(/^\w/, c => c.toUpperCase());
}

function changeMonth(direction) {
  selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1);
  updateMonthLabel();
  updateDashboard();
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`tab${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`).classList.add('active');
    });
  });
}

async function loadData() {
  expenses = await getExpenses();
  budgets = await getBudgets();
}

function updateDashboard() {
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
  });

  const totalSpent = thisMonth.filter(e => e.source === 'Familiar').reduce((sum, e) => sum + e.amount, 0);
  const available = CONFIG.MONTHLY_INCOME - totalSpent;
  const percentage = (totalSpent / CONFIG.MONTHLY_INCOME * 100).toFixed(1);
  const savings = CONFIG.MONTHLY_INCOME - totalSpent;

  document.getElementById('monthlyIncome').textContent = formatMoney(CONFIG.MONTHLY_INCOME);
  document.getElementById('totalSpent').textContent = formatMoney(totalSpent);
  document.getElementById('available').textContent = formatMoney(available);
  document.getElementById('available').className = available >= 0 ? 'summary-value positive' : 'summary-value negative';
  document.getElementById('progressPercent').textContent = `${percentage}%`;

  const savingsEl = document.getElementById('savingsAmount');
  if (savingsEl) {
    savingsEl.textContent = formatMoney(savings);
    savingsEl.className = savings >= 0 ? 'summary-value positive' : 'summary-value negative';
  }

  const progressFill = document.getElementById('progressFill');
  progressFill.style.width = `${Math.min(percentage, 100)}%`;
  progressFill.className = percentage > 100 ? 'progress-fill over' : (percentage > 80 ? 'progress-fill warning' : 'progress-fill');

  updateExpensesList(thisMonth);
  updateChart(thisMonth);
  updateCategoryPanel(thisMonth);
  updateTendencia();
}

function updateChart(thisMonth) {
  const canvas = document.getElementById('expenseChart');
  const chartEmpty = document.getElementById('chartEmpty');
  if (!thisMonth.length) { canvas.style.display = 'none'; chartEmpty.style.display = 'block'; return; }
  canvas.style.display = 'block';
  chartEmpty.style.display = 'none';
  const categoryTotals = {};
  thisMonth.forEach(e => {
    if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
    categoryTotals[e.category] += e.amount;
  });
  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const colors = ['#667eea','#764ba2','#f093fb','#f5576c','#4facfe','#00f2fe','#43e97b','#38f9d7','#fa709a','#fee140','#a18cd1','#fbc2eb','#a1c4fd','#c2e9fb','#d4fc79','#96e6a1','#fddb92'];
  if (expenseChart) expenseChart.destroy();
  expenseChart = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 2, borderColor: '#fff' }] },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } },
        tooltip: { callbacks: { label: function(context) {
          const value = context.parsed;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          return ` $${Math.round(value).toLocaleString('es-MX')} (${((value/total)*100).toFixed(1)}%)`;
        }}}
      }
    }
  });
}

function updateCategoryPanel(thisMonth) {
  const panel = document.getElementById('categoryPanel');
  if (!panel) return;
  if (!thisMonth.length) { panel.innerHTML = '<p class="empty-state">No hay gastos este mes</p>'; return; }
  const categoryTotals = {};
  const total = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  thisMonth.forEach(e => {
    if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
    categoryTotals[e.category] += e.amount;
  });
  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const colors = ['#667eea','#764ba2','#f093fb','#f5576c','#4facfe','#43e97b','#fa709a','#fee140','#a18cd1','#4facfe','#d4fc79','#96e6a1'];
  panel.innerHTML = sorted.map(([category, amount], i) => {
    const pct = ((amount / total) * 100).toFixed(1);
    const color = colors[i % colors.length];
    return `
      <div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:13px;font-weight:600;color:#374151;">${category}</span>
          <span style="font-size:13px;color:#6B7280;">${formatMoney(amount)} <strong style="color:${color}">${pct}%</strong></span>
        </div>
        <div style="background:#E5E7EB;border-radius:999px;height:8px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:999px;transition:width 0.5s ease;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function updateTendencia() {
  const canvas = document.getElementById('tendenciaChart');
  const empty = document.getElementById('tendenciaEmpty');
  if (!canvas) return;

  const monthlyTotals = {};
  expenses.forEach(e => {
    const d = new Date(e.date);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
    if (!monthlyTotals[key]) monthlyTotals[key] = { label, gastado: 0 };
    if (e.source === 'Familiar') monthlyTotals[key].gastado += e.amount;
  });

  const sorted = Object.entries(monthlyTotals).sort((a, b) => a[0].localeCompare(b[0]));

  if (sorted.length < 1) { canvas.style.display = 'none'; empty.style.display = 'block'; return; }

  canvas.style.display = 'block';
  empty.style.display = 'none';

  const labels = sorted.map(([_, v]) => v.label);
  const gastadoData = sorted.map(([_, v]) => v.gastado);
  const presupuestoData = sorted.map(() => CONFIG.MONTHLY_INCOME);

  if (tendenciaChart) tendenciaChart.destroy();

  tendenciaChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Presupuesto', data: presupuestoData, borderColor: '#43e97b', backgroundColor: 'rgba(67,233,123,0.1)', borderWidth: 2, pointRadius: 4, tension: 0.3, fill: true },
        { label: 'Gastos', data: gastadoData, borderColor: '#f5576c', backgroundColor: 'rgba(245,87,108,0.1)', borderWidth: 2, pointRadius: 4, tension: 0.3, fill: true }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: function(context) { return ` $${Math.round(context.parsed.y).toLocaleString('es-MX')}`; }}}
      },
      scales: { y: { ticks: { callback: function(value) { return '$' + Math.round(value/1000) + 'k'; }}}}
    }
  });
}

function updateExpensesList(expensesToShow) {
  const list = document.getElementById('expensesList');
  if (expensesToShow.length === 0) { list.innerHTML = '<p class="empty-state">No hay gastos registrados este mes 🎉</p>'; return; }
  expensesToShow.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  list.innerHTML = expensesToShow.slice(0, 20).map((expense, index) => `
    <div class="expense-item" id="expense-${index}">
      <div class="expense-info">
        <div class="expense-name">${expense.name}</div>
        <div class="expense-meta">${getSourceIcon(expense.source)} ${expense.category} • ${new Date(expense.date).toLocaleDateString('es-MX', {month:'short',day:'numeric'})}</div>
      </div>
      <div class="expense-amount">
        <div class="expense-amount-main">${formatMoney(expense.amount)}</div>
        <div class="expense-amount-usd">${formatUSD(expense.amount)}</div>
      </div>
      <button onclick="deleteExpense('${expense.timestamp}')" class="delete-btn">🗑️</button>
    </div>
  `).join('');
}

async function deleteExpense(timestamp) {
  if (!confirm('¿Eliminar este gasto?')) return;
  expenses = expenses.filter(e => e.timestamp !== timestamp);
  try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', timestamp }) }); } catch (e) {}
  updateDashboard();
}

async function saveManualExpense() {
  const user = getUser();
  if (!user) { alert('⚠️ Por favor inicia sesión primero'); return; }
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;
  const source = document.getElementById('expenseSource').value;
  const name = document.getElementById('expenseName').value || category;
  if (!amount || !category) { alert('⚠️ Por favor ingresa monto y categoría'); return; }
  const success = await addExpense({ user: user.email, name, amount, category, source, date: new Date().toISOString().split('T')[0], photo_url: null });
  if (success) {
    moneyRain();
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseCategory').value = '';
    document.getElementById('expenseName').value = '';
    await loadData();
    updateDashboard();
  } else { alert('❌ Error guardando gasto'); }
}

async function saveAllLineItems(count) {
  const user = getUser();
  let saved = 0;
  for (let i = 0; i < count; i++) {
    const name = document.getElementById(`itemName_${i}`)?.value;
    const amount = parseFloat(document.getElementById(`itemAmount_${i}`)?.value);
    const category = document.getElementById(`itemCategory_${i}`)?.value;
    const source = document.getElementById(`itemSource_${i}`)?.value;
    if (name && amount && category) {
      const success = await addExpense({ user: user.email, name, amount, category, source, date: new Date().toISOString().split('T')[0], photo_url: null });
      if (success) saved++;
    }
  }
  moneyRain();
  cancelOCR();
  await loadData();
  updateDashboard();
}

function exportToExcel() {
  if (!expenses.length) { alert('⚠️ No hay gastos para exportar'); return; }
  const data = expenses.map(e => ({'Fecha':e.date,'Nombre':e.name,'Monto':e.amount,'Categoria':e.category,'Fuente':e.source,'Usuario':e.user}));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gastos');
  XLSX.writeFile(wb, `gastos-familia-${new Date().toISOString().split('T')[0]}.xlsx`);
}

async function showBudgetEditor() {
  const current = CONFIG.MONTHLY_INCOME;
  const newBudget = prompt(`Presupuesto mensual actual: $${current.toLocaleString('es-MX')}\n\nIngresa el nuevo presupuesto:`);
  if (newBudget && !isNaN(newBudget)) {
    CONFIG.MONTHLY_INCOME = parseFloat(newBudget);
    localStorage.setItem('monthlyBudget', newBudget);
    document.getElementById('monthlyIncome').textContent = formatMoney(parseFloat(newBudget));
    updateDashboard();
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'updateBudget', budget: parseFloat(newBudget) })
      });
    } catch (e) {
      console.error('Error syncing budget:', e);
    }
    alert(`✅ Presupuesto actualizado a $${parseFloat(newBudget).toLocaleString('es-MX')}`);
  }
}

function formatMoney(amount) { return `$${Math.round(amount).toLocaleString('es-MX')}`; }
function formatUSD(amountMXN) { return `~$${Math.round(amountMXN / CONFIG.USD_RATE).toLocaleString('en-US')} USD`; }
function getSourceIcon(source) {
  if (source === 'Familiar') return '💰';
  if (source === 'Carlos') return '👔';
  if (source === 'Nana') return '👜';
  return '📌';
}

window.addEventListener('load', initApp);