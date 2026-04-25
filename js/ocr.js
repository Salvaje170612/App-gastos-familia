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
        
        // Show loading message
        const ocrResults = document.getElementById('ocrResults');
        ocrResults.style.display = 'block';
        ocrResults.innerHTML = '<p style="text-align:center;padding:20px;">🤖 Analizando factura con IA...</p>';
        
        await processReceiptOCR(event.target.result);
      };
      reader.readAsDataURL(file);
    });
  }
});

async function processReceiptOCR(base64Image) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image.split(',')[1]
              }
            },
            {
              type: 'text',
              text: `Analiza este recibo/factura y extrae TODOS los artículos comprados.
              
Responde SOLO con un JSON válido con este formato exacto:
{
  "items": [
    {
      "name": "nombre del artículo",
      "amount": 99.99,
      "category": "categoría"
    }
  ]
}

Las categorías disponibles son SOLO estas:
- Supermercado (comida, bebidas, abarrotes)
- Restaurantes (comida preparada, cafeterías)
- Amazon (compras online)
- Gasolina (combustible)
- Salud (medicinas, doctor, farmacia)
- Gym (ejercicio, deporte)
- Ropa (ropa, zapatos, accesorios)
- Regalos (regalos, flores)
- Casa (renta, hogar)
- Colegio (educación)
- Servicios (luz, agua, internet)
- Empleadas (servicio doméstico)
- Mama-Reposo (casa reposo)
- Mama-Medicinas (medicinas mamá)
- Mantenimiento (reparaciones)
- Viajes (transporte, hotel)
- Otros (todo lo demás)

Si no puedes leer algún artículo claramente, ponlo en Otros.
NO incluyas totales, subtotales, IVA, descuentos o cupones.
SOLO artículos comprados con su precio individual.`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (data.content && data.content[0]) {
      const text = data.content[0].text;
      try {
        const parsed = JSON.parse(text);
        showLineItems(parsed.items);
      } catch (e) {
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          showLineItems(parsed.items);
        } else {
          alert('❌ No se pudo procesar la factura. Intenta con mejor iluminación.');
        }
      }
    } else {
      alert('❌ Error procesando imagen. Intenta de nuevo.');
    }
  } catch (error) {
    console.error('❌ Error en OCR:', error);
    alert('Error procesando imagen: ' + error.message);
  }
}

function showLineItems(items) {
  const ocrResults = document.getElementById('ocrResults');
  const cameraContainer = document.querySelector('.camera-container');
  cameraContainer.style.display = 'none';
  
  const categories = ['Casa', 'Colegio', 'Mama-Reposo', 'Mama-Medicinas', 'Empleadas', 'Servicios', 'Supermercado', 'Restaurantes', 'Amazon', 'Gasolina', 'Salud', 'Gym', 'Ropa', 'Regalos', 'Mantenimiento', 'Viajes', 'Otros'];

  ocrResults.style.display = 'block';
  ocrResults.innerHTML = `
    <h3 style="margin-bottom:16px;">🤖 Artículos Detectados por IA (${items.length})</h3>
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