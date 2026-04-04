const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxOkDxeP184EIDQo1t3kYaYic1Xgcu5i_fccL4MYyQXSF-6k2qK6u3Fgdr6gcLmQY4Tag/exec';

async function loadSheetsAPI() {
  console.log('✅ Google Sheets API cargada');
  return Promise.resolve();
}

async function getExpenses() {
  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();
    const rows = data.slice(1); // Skip header row
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
    'Supermercado': 40000,
    'Restaurantes': 15000,
    'Amazon': 10000,
    'Gasolina': 15000
  };
}