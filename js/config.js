const CONFIG = {
  // Google Cloud
  GOOGLE_API_KEY: 'AIzaSyDuptObMGsVgNdH-kuY0oiyAWIxaRoSCQw',
  
  // Google Sheets
  SPREADSHEET_ID: '1MkIrZNQ4jBhWIgd8IAOi-e30fMo0tj65IYOROqBcupg',
  
  // Vision API
  VISION_API_ENDPOINT: 'https://vision.googleapis.com/v1/images:annotate',

  // Anthropic AI
  ANTHROPIC_API_KEY: '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',
  
  // Constantes
  USD_RATE: 18.8,
  MONTHLY_INCOME: 450000,
  
  // Presupuestos
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
    'Viajes': 0,
    'Otros': 5000
  },
  
  CATEGORIES: [
    { value: 'Casa', label: '🏠 Casa - Renta' },
    { value: 'Colegio', label: '🎓 Colegio Greengates' },
    { value: 'Mama-Reposo', label: '💝 Mamá - Casa Reposo' },
    { value: 'Mama-Medicinas', label: '💊 Mamá - Medicinas' },
    { value: 'Empleadas', label: '👥 Empleadas' },
    { value: 'Servicios', label: '💡 Servicios' },
    { value: 'Supermercado', label: '🛒 Supermercado/Comida' },
    { value: 'Restaurantes', label: '🍽️ Restaurantes' },
    { value: 'Amazon', label: '📦 Amazon' },
    { value: 'Gasolina', label: '⛽ Gasolina' },
    { value: 'Salud', label: '🏥 Salud/Doctor' },
    { value: 'Gym', label: '💪 Gym/Actividades' },
    { value: 'Ropa', label: '👗 Ropa/Personal' },
    { value: 'Regalos', label: '🎁 Regalos' },
    { value: 'Mantenimiento', label: '🔧 Mantenimiento' },
    { value: 'Viajes', label: '✈️ Viajes' },
    { value: 'Otros', label: '📌 Otros' }
  ]
};