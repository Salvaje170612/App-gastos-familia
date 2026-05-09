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

function showPopup(html) {
  const existing = document.getElementById('ocrPopup');
  if (existing) existing.remove();
  if (!document.getElementById('loadingStyle')) {
    const style = document.createElement('style');
    style.id = 'loadingStyle';
    style.textContent = '@keyframes bounce{0%{transform:translateY(0);}100%{transform:translateY(-10px);}} @keyframes fadeIn{0%{opacity:0;transform:scale(0.9);}100%{opacity:1;transform:scale(1);}}';
    document.head.appendChild(style);
  }
  const overlay = document.createElement('div');
  overlay.id = 'ocrPopup';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
  overlay.innerHTML = '<div style="background:white;border-radius:24px;padding:32px;text-align:center;max-width:320px;width:100%;animation:fadeIn 0.3s ease;">' + html + '</div>';
  document.body.appendChild(overlay);
}

function hidePopup() {
  const popup = document.getElementById('ocrPopup');
  if (popup) popup.remove();
}

function showLoadingPopup(message) {
  showPopup('<div style="font-size:48px;margin-bottom:16px;">🤖</div><div style="font-size:16px;font-weight:700;color:#1E3A8A;margin-bottom:8px;">' + message + '</div><div style="font-size:13px;color:#718096;margin-bottom:20px;">Por favor espera...</div><div style="display:flex;justify-content:center;gap:8px;"><div style="width:10px;height:10px;background:#667eea;border-radius:50%;animation:bounce 0.6s infinite alternate;"></div><div style="width:10px;height:10px;background:#667eea;border-radius:50%;animation:bounce 0.6s infinite alternate 0.2s;"></div><div style="width:10px;height:10px;background:#667eea;border-radius:50%;animation:bounce 0.6s infinite alternate 0.4s;"></div></div>');
}

function showResultsPopup(items) {
  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  window._ocrItems = items;
  showPopup('<div style="font-size:48px;margin-bottom:8px;">🧾</div><div style="font-size:20px;font-weight:800;color:#1E3A8A;margin-bottom:4px;">' + items.length + ' artículos detectados</div><div style="font-size:13px;color:#718096;margin-bottom:20px;">Factura analizada con IA</div><div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:16px;border-radius:16px;margin-bottom:24px;"><div style="font-size:13px;opacity:0.8;margin-bottom:4px;">Total detectado</div><div style="font-size:28px;font-weight:800;">$' + Math.round(total).toLocaleString('es-MX') + '</div></div><div style="font-size:14px;font-weight:700;color:#374151;margin-bottom:12px;">¿A quién pertenece este gasto?</div><div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px;text-align:left;"><label id="lbl0" style="display:flex;align-items:center;gap:10px;padding:12px;border:2px solid #667eea;background:#EEF2FF;border-radius:12px;cursor:pointer;" onclick="selectSource(this)"><input type="radio" name="source" value="Familiar" checked style="width:18px;height:18px;accent-color:#667eea;"> <span style="font-size:15px;">💰 Familiar</span></label><label id="lbl1" style="display:flex;align-items:center;gap:10px;padding:12px;border:2px solid #E5E7EB;border-radius:12px;cursor:pointer;" onclick="selectSource(this)"><input type="radio" name="source" value="Carlos" style="width:18px;height:18px;accent-color:#667eea;"> <span style="font-size:15px;">👔 Carlos</span></label><label id="lbl2" style="display:flex;align-items:center;gap:10px;padding:12px;border:2px solid #E5E7EB;border-radius:12px;cursor:pointer;" onclick="selectSource(this)"><input type="radio" name="source" value="Nana" style="width:18px;height:18px;accent-color:#667eea;"> <span style="font-size:15px;">👜 Nana</span></label></div><button onclick="saveOCRItems()" style="width:100%;padding:14px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;margin-bottom:8px;">✅ Guardar Todo</button><button onclick="hidePopup();cancelOCR();" style="width:100%;padding:12px;background:#F3F4F6;color:#6B7280;border:none;border-radius:14px;font-size:14px;cursor:pointer;">❌ Cancelar</button>');
}

function selectSource(label) {
  document.querySelectorAll('#ocrPopup label').forEach(l => { l.style.border = '2px solid #E5E7EB'; l.style.background = 'white'; });
  label.style.border = '2px solid #667eea';
  label.style.background = '#EEF2FF';
}

async function saveOCRItems() {
  const sourceEl = document.querySelector('#ocrPopup input[name="source"]:checked');
  const source = sourceEl ? sourceEl.value : 'Familiar';
  const items = window._ocrItems || [];
  showLoadingPopup('Guardando gastos...');
  const user = window.currentUser || null;
  for (const item of items) {
    if (item.name && item.amount) {
      await addExpense({ user: user.email, name: item.name, amount: parseFloat(item.amount), category: item.category || 'Otros', source: source, date: new Date().toISOString().split('T')[0], photo_url: null });
    }
  }
  hidePopup();
  cancelOCR();
  moneyRain();
  await loadData();
  updateDashboard();
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
    const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'analyzeReceipt', imageBase64: imageData }) });
    const result = await response.json();
    hidePopup();
    if (result.items && result.items.length > 0) { showResultsPopup(result.items); }
    else if (result.error) { alert('Error: ' + result.error); }
    else { alert('No se pudo leer la factura.'); }
  } catch (error) {
    hidePopup();
    alert('Error: ' + error.message);
  }
}

function cancelOCR() {
  const ocrResults = document.getElementById('ocrResults');
  if (ocrResults) { ocrResults.style.display = 'none'; ocrResults.innerHTML = ''; }
  const cam = document.querySelector('.camera-container');
  if (cam) cam.style.display = 'block';
  const prev = document.getElementById('previewImage');
  if (prev) prev.style.display = 'none';
  const input = document.getElementById('cameraInput');
  if (input) input.value = '';
}
