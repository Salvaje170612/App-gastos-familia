const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxOkDxeP184EIDQo1t3kYaYic1Xgcu5i_fccL4MYyQXSF-6k2qK6u3Fgdr6gcLmQY4Tag/exec';

async function loadSheetsAPI() {
  console.log('✅ Google Sheets API cargada');
  return Promise.resolve();
}

async function getExpenses() {
  try {
    const response = await fetch(SCRIPT_URL);
    const result = await response.json();
    
    const rawData = Array.isArray(result) ? result : result.data;
    
    if (result.budget && result.budget !== CONFIG.MONTHLY_INCOME) {
      CONFIG.MONTHLY_INCOME = result.budget;
      localStorage.setItem('monthlyBudget', result.budget);
      const el = document.getElementById('monthlyIncome');
      if (el) el.textContent = `$${Math.round(result.budget).toLocaleString('es-MX')}`;
    }
    
    const rows = rawData.slice(1);
    return rows.map(row => ({
      timestamp: row[0],
      user: row[1],
      name: row[2],
      amount: parseFloat(row[3]),
      category: row[4],
      source: row[5],
      date: row[6],
      photo_url: row[7] || null,
    }));
  } catch (error) {
    console.error('Error leyendo gastos:', error);
    return [];
  }
}

async function addExpense(expense) {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        user: expense.user,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        source: expense.source,
        date: expense.date,
        photo_url: expense.photo_url || ''
      })
    });
    const data = await response.json();
    console.log('✅ Gasto agregado');
    return true;
  } catch (error) {
    console.error('❌ Error agregando gasto:', error);
    return false;
  }
}

async function getBudgets() {
  return {
    'Casa': 160500,
    'Colegio': 120000,
    'Mama-Reposo': 25000,
    'Mama-Medicinas': 12000,
    'Empleadas': 25600,
    'Servicios': 19700,
    'Supermercado': 40000,
    'Restaurantes': 5000,
    'Amazon': 3000,
    'Gasolina': 3000,
    'Salud': 10000,
    'Gym': 6700,
    'Ropa': 3000,
    'Regalos': 3000,
    'Mantenimiento': 5000,
    'Viajes': 0,
    'Otros': 5000
  };
}