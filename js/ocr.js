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
        img.onload = async function() { await processReceiptOCR(img); };
        if (img.complete && img.naturalWidth > 0) { await processReceiptOCR(img); }
      };
      reader.readAsDataURL(file);
    });
  }
});

function showLoadingPopup(message) {
  const existing = document.getElementById('loadingPopup');
  if (existing) existing.remove();
  if (!document.getElementById('loadingStyle')) {
    const style = document.createElement('style');
    style.id = 'loadingStyle';
    style.textContent = '@keyframes bounce{0%{transform:translateY(0);}100%{transform:translateY(-10px);}}';
    document.head.appendChild(style);
  }
  const popup = document.createElement('div');
  popup.id = 'loadingPopup';
  popup.style.position = 'fixed';
  popup.style.top = '0';
  popup.style.left = '0';
  popup.style.width = '100%';
  popup.style.height = '100%';
  popup.style.background = 'rgba(0,0,0,0.7)';
  popup.style.zIndex = '2147483647';
  popup.style.display = 'flex';
  popup.style.alignItems = 'center';
  popup.style.justifyContent = 'center';
  popup.innerHTML = '<div style="background:white;border-radius:20px;padding:32px 40px;text-align:center;max-width:280px;"><div style="font-size:48px;margin-bottom:16px;">🤖</div><div style="font-size:16px;font-weight:700;color:#1E3A8A;margin-bottom:8px;">' + message + '</div><div style="font-size:13px;color:#718096;margin-bottom:20px;">Por favor espera...</div><div style="display:flex;justify-content:center;gap:8px;"><div style="width:10px;height:10px;background:#667eea;border-radius:50%;animation:bounce 0.6s infinite alternate;"></div><div style="width:10px;height:10px;background:#667eea;border-radius:50%;animation:bounce 0.6s infinite alternate 0.2s;"></div><div style="width:10px;height:10px;background:#667eea;border-radius:50%;animation:bounce 0.6s infinite alternate 0.4s;"></div></div></div>';
  document.body.appendChild(popup);
}

function hideLoadingPopup() {
  const popup = document.getElementById('loadingPopup');
  if (popup) popup.remove();
}

async function processReceiptOCR(imgEl) {
  showLoadingPopup('Analizando factura con IA...');
  try {
    const canvas = document.createElement('canvas');
    const maxSize = 1200;
    const ratio = Math.min(maxSize / imgEl.naturalWidth, maxSize / imgEl.naturalHeight, 1);
    canvas.width = imgEl.naturalWidth * ratio;
    canvas.height = imgEl.naturalHeight * ratio;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    const compressed = canvas.toDataURL('image/jpeg', 0.6);
    const imageData = compressed.split(',')[1];
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'analyzeReceipt', imageBase64: imageData })
    });
    const result = await response.json();
    hideLoadingPopup();
    if (result.items && result.items.length > 0) {
      showLineItems(result.items);
    } else if (result.error) {
      alert('Error: ' + result.error);
    } else {
      alert('No se pudo leer la factura. Intenta con mejor iluminacion.');
    }
  } catch (error) {
    hideLoadingPopup();
    alert('Error: ' + error.message);
  }
}

function showLineItems(items) {
  const ocrResults = document.getElementById('ocrResults');
  document.querySelector('.camera-container').style.display = 'none';
  const categories = ['Casa','Colegio','Mama-Reposo','Mama-Medicinas','Empleadas','Servicios','Supermercado','Restaurantes','Amazon','Gasolina','Salud','Gym','Ropa','Regalos','Mantenimiento','Viajes','Otros'];
  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  ocrResults.style.display = 'block';
  ocrResults.innerHTML = '<h3 style="margin-bottom:16px;">Articulos Detectados (' + items.length + ')</h3><div id="lineItemsList">' +
    items.map((item, i) => '<div style="background:white;padding:12px;border-radius:10px;margin-bottom:10px;border:1px solid #E2E8F0;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><input type="text" value="' + item.name + '" id="itemName_' + i + '" style="flex:1;padding:6px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;margin-right:8px;"><input type="number" value="' + item.amount + '" id="itemAmount_' + i + '" style="width:80px;padding:6px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"></div><div style="display:flex;gap:8px;"><select id="itemCategory_' + i + '" style="flex:1;padding:6px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;">' + categories.map(c => '<option value="' + c + '"' + (c === item.category ? ' selected' : '') + '>' + c + '</option>').join('') + '</select><select id="itemSource_' + i + '" style="flex:1;padding:6px;border:1px solid #E2E8F0;border-radius:6px;font-size:13px;"><option value="Familiar">Familiar</option><option value="Carlos">Carlos</option><option value="Nana">Nana</option></select></div></div>').join('') +
    '</div><div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:16px;border-radius:12px;margin:16px 0;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:15px;font-weight:600;">Total Detectado</span><span style="font-size:20px;font-weight:800;">$' + Math.round(total).toLocaleString('es-MX') + '</span></div>' +
    '<button class="btn-primary" onclick="saveAllLineItems(' + items.length + ')" style="margin-top:4px;">Guardar Todo (' + items.length + ' articulos)</button>' +
    '<button class="btn-secondary" onclick="cancelOCR()" style="margin-top:8px;width:100%;">Cancelar</button>';
}

async function saveAllLineItems(count) {
  showLoadingPopup('Guardando gastos...');
  await new Promise(r => setTimeout(r, 100));
  const user = window.currentUser || null;
  for (let i = 0; i < count; i++) {
    const name = document.getElementById('itemName_' + i) ? document.getElementById('itemName_' + i).value : null;
    const amount = parseFloat(document.getElementById('itemAmount_' + i) ? document.getElementById('itemAmount_' + i).value : 0);
    const category = document.getElementById('itemCategory_' + i) ? document.getElementById('itemCategory_' + i).value : null;
    const source = document.getElementById('itemSource_' + i) ? document.getElementById('itemSource_' + i).value : null;
    if (name && amount && category) {
      await addExpense({ user: user.email, name, amount, category, source, date: new Date().toISOString().split('T')[0], photo_url: null });
    }
  }
  hideLoadingPopup();
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
