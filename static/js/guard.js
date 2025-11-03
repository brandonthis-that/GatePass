// Guard page JS: polls ANPR status and handles QR capture
document.addEventListener('DOMContentLoaded', function(){
  const statusEl = document.getElementById('anpr-status');
  const simulateForm = document.getElementById('simulate-form');
  const simulateInput = document.getElementById('simulate-plate');
  const guardSelect = document.getElementById('guard-select');

  simulateForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const plate = simulateInput.value.trim();
    if(!plate) return;
  const guard_id = guardSelect ? guardSelect.value : '';
  const body = `plate=${encodeURIComponent(plate)}` + (guard_id?`&guard_id=${encodeURIComponent(guard_id)}`:'');
  await fetch('/simulate_plate', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: body});
    // reflect immediately
    statusEl.innerHTML = `<div class="granted"><strong>SIMULATED</strong><br>Plate: ${plate}</div>`;
    simulateInput.value = '';
  });

  // QR scanning using client-side jsQR
  const video = document.getElementById('qr-video');
  const startBtn = document.getElementById('start-scan');
  const stopBtn = document.getElementById('stop-scan');
  const qrResult = document.getElementById('qr-result');
  let stream;
  let scanning = false;
  let scanLoopId = null;

  async function startCamera(){
    try{
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
      video.srcObject = stream;
      await video.play();
    }catch(e){
      qrResult.innerText = 'Unable to access camera';
      console.error(e);
    }
  }

  function stopCamera(){
    if(stream){
      stream.getTracks().forEach(t=>t.stop());
      stream = null;
    }
    video.pause();
    video.srcObject = null;
  }

  function scanOnce(){
    if(!video || video.readyState !== 4) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if(code && code.data){
      // got student id
      scanning = false;
      stopCamera();
        const guard_id = guardSelect ? guardSelect.value : '';
        const data = code.data || '';
        // detect asset QR protocol 'ASSET:<serial>'
        if(data.startsWith('ASSET:')){
          const serial = data.split(':',2)[1];
          qrResult.innerText = `Decoded Asset: ${serial} — looking up...`;
          fetch('/asset_lookup', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({serial: serial, guard_id: guard_id})})
            .then(r=>r.json())
            .then(j=>{
              if(j.match){
                qrResult.innerHTML = `<div class="granted"><strong>ASSET FOUND</strong><br>Serial: ${j.asset.serial}<br>Type: ${j.asset.type}<br>Owner: ${j.asset.student_name || '—'}</div>`;
              } else {
                qrResult.innerHTML = `<div class="denied"><strong>ASSET NOT FOUND</strong><br>${j.message || ''}</div>`;
              }
            }).catch(e=>{ qrResult.innerText = 'Asset lookup failed'; console.error(e); });
        } else {
          // treat as student id
          qrResult.innerText = 'Decoded: ' + data + ' — looking up...';
          fetch('/qr_lookup', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({student_id: data, guard_id: guard_id})})
            .then(r=>r.json())
            .then(j=>{
              if(j.match){
                qrResult.innerHTML = `<div class="granted"><strong>VALID STUDENT</strong><br>Name: ${j.student.name}<br>ID: ${j.student.id}</div>` + (j.assets.length?('<div>Registered assets:<ul>'+j.assets.map(a=>`<li>${a.Type||a.type||'Asset'}: ${a.SerialNumber||a.serialnumber||a.SerialNumber}</li>`).join('')+'</ul></div>'):'');
              } else {
                qrResult.innerHTML = `<div class="denied"><strong>INVALID ID</strong><br>${j.message || 'No student found.'}</div>`;
              }
            }).catch(e=>{ qrResult.innerText = 'Lookup failed'; console.error(e); });
        }
    }
  }

  function startScanningLoop(){
    if(scanning) return;
    scanning = true;
    startCamera().then(()=>{
      scanLoopId = setInterval(scanOnce, 500);
    });
  }

  function stopScanningLoop(){
    scanning = false;
    if(scanLoopId) clearInterval(scanLoopId);
    scanLoopId = null;
    stopCamera();
  }

  startBtn.addEventListener('click', function(){ qrResult.innerText = 'Starting...'; startScanningLoop(); });
  stopBtn.addEventListener('click', function(){ stopScanningLoop(); qrResult.innerText = 'Stopped'; });

});
