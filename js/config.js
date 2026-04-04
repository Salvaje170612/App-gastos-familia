const CONFIG = {
  // ========== GOOGLE CLOUD ==========
  GOOGLE_API_KEY: 'AIzaSyDuptObMGsVgNdH-kuY0oiyAWIxaRoSCQw',  // ← your Google Cloud API key
  GOOGLE_CLIENT_ID: '',
  
  // ========== GOOGLE SHEETS ==========
  SPREADSHEET_ID: '1MkIrZNQ4jBhWIgd8IAOi-e30fMo0tj65IYOROqBcupg',  // ← your Spreadsheet ID
  
  // ========== VISION API ==========
  VISION_API_ENDPOINT: 'https://vision.googleapis.com/v1/images:annotate',
  
  // ========== FIREBASE ==========
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyDRLEw8W-GcYCUaEeIDLsvPGN79zegZaO0",  // ← Firebase API key
    authDomain: "app-gastos-familia-f5c8b.firebaseapp.com",
    projectId: "app-gastos-familia-f5c8b",
    storageBucket: "app-gastos-familia-f5c8b.firebasestorage.app",
    messagingSenderId: "72954833295",
    appId: "1:72954833295:web:c48291b0b4203ae3f4c3fa"
  },
  
  // ========== USUARIOS PERMITIDOS ==========
  ALLOWED_USERS: {
    admin: 'Carlosrojasgirao@gmail.com',   // ← your dad's Gmail
    user: 'Catherineberaun@gmail.com'     // ← your mom's Gmail
  },
  
  // ========== CONSTANTES ==========
  USD_RATE: 18.8,
  MONTHLY_INCOME: 450000,
  
  // ========== PRESUPUESTOS ==========
  DEFAULT_BUDGETS: {
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
    'Otros': 5000
  },
  
  // ========== CATEGORÍAS ==========
  CATEGORIES: [
    { value: 'Casa', label: '🏠 Casa - Renta', type: 'fixed' },
    { value: 'Colegio', label: '🎓 Colegio Greengates', type: 'fixed' },
    { value: 'Mama-Reposo', label: '💝 Mamá - Casa Reposo', type: 'fixed' },
    { value: 'Mama-Medicinas', label: '💊 Mamá - Medicinas', type: 'fixed' },
    { value: 'Empleadas', label: '👥 Empleadas', type: 'fixed' },
    { value: 'Servicios', label: '💡 Servicios', type: 'fixed' },
    { value: 'Supermercado', label: '🛒 Supermercado/Comida', type: 'variable' },
    { value: 'Restaurantes', label: '🍽️ Restaurantes', type: 'variable' },
    { value: 'Amazon', label: '📦 Amazon', type: 'variable' },
    { value: 'Gasolina', label: '⛽ Gasolina', type: 'variable' },
    { value: 'Salud', label: '🏥 Salud/Doctor', type: 'variable' },
    { value: 'Gym', label: '💪 Gym/Actividades', type: 'variable' },
    { value: 'Ropa', label: '👗 Ropa/Personal', type: 'variable' },
    { value: 'Regalos', label: '🎁 Regalos', type: 'variable' },
    { value: 'Mantenimiento', label: '🔧 Mantenimiento', type: 'variable' },
    { value: 'Viajes', label: '✈️ Viajes', type: 'variable' },
    { value: 'Otros', label: '📌 Otros', type: 'variable' }
  ]
};