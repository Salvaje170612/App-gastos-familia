document.addEventListener('DOMContentLoaded', function() {
  const cameraInput = document.getElementById('cameraInput');
  if (cameraInput) {
    cameraInput.addEventListener('change', async function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async function(event) {
        const img = document.getElementById('previewImage');
        img.src = event.target.result;
        img.style.display = 'block';
        await processReceiptOCR(event.target.result);
      };
      reader.readAsDataURL(file);
    });
  }
});

async function processReceiptOCR(base64Image) {
  const requestBody = {
    requests: [{
      image: { content: base64Image.split(',')[1] },
      features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
    }]
  };

  try {
    const response = await fetch(
      `${CONFIG.VISION_API_ENDPOINT}?key=${CONFIG.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );
    const data = await response.json();
    if (data.responses && data.responses[0].textAnnotations) {
      const fullText = data.responses[0].textAnnotations[0].description;
      console.log('OCR TEXT:', fullText);
      const items = parseReceiptItems(fullText);
      console.log('ITEMS FOUND:', items);
      showLineItems(items);
    } else {
      alert('❌ No se pudo leer texto. Intenta con mejor iluminación.');
    }
  } catch (error) {
    console.error('❌ Error en OCR:', error);
    alert('Error procesando imagen');
  }
}

function guessCategory(itemName) {
  const name = itemName.toLowerCase();
  if (name.match(/hambur|fresa|uva|verdura|fruta|pollo|carne|leche|queso|jamon|pan|tortilla|cereal|cafe|arroz|frijol|atun|sopa|galleta|chocolate|dulce|candy|snack|botana|pretzel|brioche|bollo|agua|jugo|refresco|yogurt|pepsi|coca|walmart|super|costco|soriana|chedraui/)) return 'Supermercado';
  if (name.match(/flor|flores|regalo|regalos|present|bouquet/)) return 'Regalos';
  if (name.match(/gasolina|gas|pemex|combustible|diesel/)) return 'Gasolina';
  if (name.match(/restaurant|taco|pizza|burger|sushi|comida|almuerzo|cena|desayuno|coffee/)) return 'Restaurantes';
  if (name.match(/amazon|envio|shipping|delivery|paquete/)) return 'Amazon';
  if (name.match(/doctor|medico|medicina|farmacia|hospital|clinica|pastilla|vitamina|minoxidil|protein|vital/)) return 'Salud';
  if (name.match(/gym|ejercicio|deporte|sport|fitness/)) return 'Gym';
  if (name.match(/ropa|camisa|pantalon|zapato|vestido|playera|blusa|conjunto|hurley|short|dama|cabal/)) return 'Ropa';
  if (name.match(/luz|internet|telefono|cable|electricidad/)) return 'Servicios';
  if (name.match(/colegio|escuela|school|utiles|libro|cuaderno/)) return 'Colegio';
  return 'Otros';
}

function parseReceiptItems(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const items = [];
  
  const skipWords = ['total', 'subtotal', 'iva', 'tax', 'cambio', 'efectivo', 'tarjeta', 'ticket', 'folio', 'fecha', 'gracias', 'rfc', 'tel', 'direccion', 'calle', 'col', 'cp', 'descuento', 'cupon'];

  // First try: same line format
  for (const line of lines) {
    const match = line.trim().match(/^(.+?)\s+(\d{1,6}[.,]\d{2})\s*[A-Za-z*-]?\s*$/);
    if (match) {
      const name = match[1].trim();
      const amount = parseFloat(match[2].replace(',', '.'));
      const nameLower = name.toLowerCase();
      const isSkip = skipWords.some(w => nameLower.includes(w));
      if (!isSkip && amount > 0 && amount < 50000) {
        const cleanName = name.replace(/^\d{4,}\s+/, '').trim();
        items.push({
          name: cleanName,
          amount: amount,
          category: guessCategory(cleanName),
          source: 'Familiar'
        });
      }
    }
  }

  // Second try: split format (names on top, prices on bottom)
  if (items.length === 0) {
    const nameLines = [];
    const priceLines = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const priceOnly = trimmed.match(/^0*(\d{1,6}[.,]\d{2})\s*[A-Za-z*-]?\s*$/);
      if (priceOnly) {
        const amount = parseFloat(priceOnly[1].replace(',', '.'));
        if (amount > 0) priceLines.push(amount);
      } else {
        const nameLower = trimmed.toLowerCase();
        const isSkip = skipWords.some(w => nameLower.includes(w));
        if (!isSkip && trimmed.length > 2) {
          const cleanName = trimmed.replace(/^\d{4,}\s+/, '').trim();
          if (cleanName.length > 1) nameLines.push(cleanName);
        }
      }
    }

    const count = Math.min(nameLines.length, priceLines.length);
    for (let i = 0; i < count; i++) {
      items.push({
        name: nameLines[i],
        amount: priceLines[i],
        category: guessCategory(nameLines[i]),
        source: 'Familiar'
      });
    }
  }

  if (items.length === 0) {
    const totalMatch = text.match(/total[\s:$]*(\d+\.?\d{0,2})/i);
    if (totalMatch) {
      items.push({
        name: 'Gasto de factura',
        amount: parseFloat(totalMatch[1]),
        category: 'Otros',
        source: 'Familiar'
      });
    }
  }

  return items;
}

function showLineItems(items) {
  const ocrResults = document.getElementById('ocrResults');
  const cameraContainer = document.querySelector('.camera-container');
  cameraContainer.style.display = 'none';
  const categories = ['Casa', 'Colegio', 'Mama-Reposo', 'Mama-Medicinas', 'Empleadas', 'Servicios', 'Supermercado', 'Restaurantes', 'Amazon', 'Gasolina', 'Salud', 'Gym', 'Ropa', 'Regalos', 'Mantenimiento', 'Viajes', 'Otros'];

  ocrResults.style.display = 'block';
  ocrResults.innerHTML = `
    <h3 style="margin-bottom:16px;">🧾 Artículos Detectados (${items.length})</h3>
    <div id="lineItemsList">
      ${items.map((item, i) => `
        <div style="background:white;padding:12px;border-radius:10px;margin-bottom:10px;border:1px solid #E2E8F0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <input type="text" value="${item.name}" id="itemName_${i}" style="flex:1;padding:6px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;margin-right:8px;">
            <input type="number" value="${item.amount}" id="itemAmount_${i}" style="width:80px;padding:6px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;">
          </div>
          <div style="display:flex;gap:8px;">
            <select id="itemCategory_${i}" style="flex:1;padding:6px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;">
              ${categories.map(c => `<option value="${c}" ${c === item.category ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <select id="itemSource_${i}" style="flex:1;padding:6px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;">
              <option value="Familiar">💰 Familiar</option>
              <option value="Carlos">👔 Carlos</option>
              <option value="Nana">👜 Nana</option>
            </select>
          </div>
        </div>
      `).join('')}
    </div>
    <button class="btn-primary" onclick="saveAllLineItems(${items.length})" style="margin-top:12px;">✅ Guardar Todo (${items.length} artículos)</button>
    <button class="btn-secondary" onclick="cancelOCR()" style="margin-top:8px;width:100%;">❌ Cancelar</button>
  `;
}

async function saveAllLineItems(count) {
  const user = window.currentUser || null;
  let saved = 0;
  for (let i = 0; i < count; i++) {
    const name = document.getElementById(`itemName_${i}`)?.value;
    const amount = parseFloat(document.getElementById(`itemAmount_${i}`)?.value);
    const category = document.getElementById(`itemCategory_${i}`)?.value;
    const source = document.getElementById(`itemSource_${i}`)?.value;
    if (name && amount && category) {
      const expense = {
        user: user.email,
        name, amount, category, source,
        date: new Date().toISOString().split('T')[0],
        photo_url: null
      };
      const success = await addExpense(expense);
      if (success) saved++;
    }
  }
  moneyRain();
  cancelOCR();
  await loadData();
  updateDashboard();
}

function cancelOCR() {
  document.getElementById('ocrResults').style.display = 'none';
  document.getElementById('ocrResults').innerHTML = '';
  document.querySelector('.camera-container').style.display = 'block';
  document.getElementById('previewImage').style.display = 'none';
  document.getElementById('cameraInput').value = '';
}