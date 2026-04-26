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
        
        const ocrResults = document.getElementById('ocrResults');
        ocrResults.style.display = 'block';
        ocrResults.innerHTML = '<p style="text-align:center;padding:20px;font-size:16px;">🤖 Analizando factura con IA...</p>';
        
        img.onload = async function() {
          await processReceiptOCR(img);
        };
        
        if (img.complete && img.naturalWidth > 0) {
          await processReceiptOCR(img);
        }
      };
      reader.readAsDataURL(file);
    });
  }
});

async function processReceiptOCR(imgEl) {
  try {
    const canvas = document.createElement('canvas');
    const maxSize = 400;
    const ratio = Math.min(maxSize / imgEl.naturalWidth, maxSize / imgEl.naturalHeight, 1);
    canvas.width = imgEl.naturalWidth * ratio;
    canvas.height = imgEl.naturalHeight * ratio;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    const compressed = canvas.toDataURL('image/jpeg', 0.4);
    const imageData = compressed.split(',')[1];
    
    console.log('Image size:', imageData.length);
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'analyzeReceipt',
        imageBase64: imageData
      })
    });

    const result = await response.json();
    console.log('OCR result:', result);
    
    if (result.items && result.items.length > 0) {
      showLineItems(result.items);
    } else if (result.error) {
      alert('❌ Error: ' + result.error);
    } else {
      alert('❌ No se pudo leer la factura. Intenta con mejor iluminación.');
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