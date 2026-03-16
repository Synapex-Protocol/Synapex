/* SYNAPEX LAB — Face Recognition Module */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initFaceRec = function (el) {
  var toggle = SynapexLab.toggle, range = SynapexLab.range, sel = SynapexLab.sel, num = SynapexLab.num, wireRanges = SynapexLab.wireRanges;
  let engine = null;

  el.innerHTML = `
    <div class="fr-actions-bar">
      <button class="tm-btn" id="frStartCam">Start Camera</button>
      <button class="tm-btn outline" id="frToggleScan" disabled>Start Scanning</button>
      <button class="tm-btn outline" id="frAddPerson">+ Add Person</button>
      <button class="tm-btn outline" id="frExportDB">Export Database</button>
      <button class="tm-btn outline" id="frExportPy">Export Python</button>
    </div>

    <div class="fr-live-area">
      <div class="fr-camera-wrap">
        <video id="frVideo" playsinline muted></video>
        <canvas id="frCanvas"></canvas>
        <div class="fr-camera-overlay" id="frOverlay">
          <div class="fr-camera-placeholder">Click "Start Camera" to begin<br>face detection & recognition</div>
        </div>
        <div class="fr-camera-status off" id="frStatus"><span class="dot"></span>OFFLINE</div>
        <div class="fr-camera-fps" id="frFps">0 FPS</div>
      </div>
      <div class="fr-sidebar" id="frPersonList">
        <div style="text-align:center;padding:20px;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);">
          No persons in database.<br>Click "+ Add Person" then scan their face.
        </div>
      </div>
    </div>

    <div class="tm-split">
      <div>
        <div class="tm-params">
          <div class="tm-params-title">Detection & Scan Parameters</div>
          ${range('frMinFace', 'Minimum Face Size (px)', 20, 300, 60, 10, 'px')}
          ${range('frScanInterval', 'Scan Interval (ms)', 100, 3000, 500, 50, 'ms')}
          ${range('frMatchThresh', 'Recognition Threshold', 0.3, 0.95, 0.62, 0.01, '')}
          ${sel('frDetMethod', 'Detection Method', [{v:'auto',t:'Auto (native if available)',s:true},'skin'])}
          ${range('frMaxSamples', 'Max Samples per Person', 5, 200, 50, 5, '')}
        </div>

        <div class="tm-params" style="margin-top:14px;">
          <div class="tm-params-title">Auto-Training (Humanoid Mode)</div>
          ${toggle('frAutoTrain', 'Auto-Train on Recognition', 'Add new descriptor sample each time a known person is scanned', true)}
          ${toggle('frAutoScan', 'Continuous Scan Mode', 'Capture descriptors every scan interval while faces are visible', true)}
          ${toggle('frMultiAngle', 'Multi-Angle Accumulation', 'Keep samples from different viewing angles for robustness', true)}
          ${range('frDescSize', 'Descriptor Size', 64, 512, 256, 64, '')}
        </div>
      </div>

      <div>
        <div class="tm-params">
          <div class="tm-params-title">Skin Color Detection Tuning</div>
          ${range('frSkinYMin', 'Y Min (brightness)', 0, 150, 60, 5, '')}
          ${range('frSkinYMax', 'Y Max', 150, 255, 255, 5, '')}
          ${range('frSkinCbMin', 'Cb Min (blue-diff)', 50, 130, 77, 1, '')}
          ${range('frSkinCbMax', 'Cb Max', 100, 180, 127, 1, '')}
          ${range('frSkinCrMin', 'Cr Min (red-diff)', 100, 180, 133, 1, '')}
          ${range('frSkinCrMax', 'Cr Max', 140, 220, 173, 1, '')}
          ${range('frMinRegion', 'Min Region Ratio', 0.001, 0.05, 0.008, 0.001, '')}
        </div>
      </div>
    </div>

    <div class="tm-section" style="margin-top:20px;">
      <div class="tm-heading">Recognition Log</div>
      <div class="fr-log" id="frLog"><span class="ev-sys">[system]</span> Face Recognition Engine initialized. Ready to start camera.</div>
    </div>
  `;

  wireRanges(el);

  engine = new FaceRecEngine();
  engine.onLog = (type, msg) => logMsg(type, msg);

  const fpsEl = document.getElementById('frFps');
  setInterval(() => { if (engine && engine.running) fpsEl.textContent = engine.fps + ' FPS'; }, 500);

  engine.onDetection = (face) => {
    if (!face.match || !face.match.personId) {
      logMsg('detect', `Face detected at [${face.x},${face.y}] ${face.w}x${face.h} — no match`);
    }
  };

  engine.onRecognition = (match, face) => {
    const person = engine.persons[match.personId];
    if (!person) return;
    logMsg('match', `Recognized: "${person.name}" (${(match.similarity * 100).toFixed(1)}%) — samples: ${person.scanCount}`);
    renderPersonList();
  };

  document.getElementById('frStartCam').addEventListener('click', async function () {
    if (engine.running) {
      engine.stopCamera();
      this.textContent = 'Start Camera';
      document.getElementById('frStatus').className = 'fr-camera-status off';
      document.getElementById('frStatus').innerHTML = '<span class="dot"></span>OFFLINE';
      document.getElementById('frOverlay').style.display = '';
      document.getElementById('frToggleScan').disabled = true;
      return;
    }

    syncConfig();
    document.getElementById('frOverlay').style.display = 'none';
    const ok = await engine.startCamera(
      document.getElementById('frVideo'),
      document.getElementById('frCanvas')
    );
    if (ok) {
      this.textContent = 'Stop Camera';
      document.getElementById('frStatus').className = 'fr-camera-status';
      document.getElementById('frStatus').innerHTML = '<span class="dot"></span>LIVE';
      document.getElementById('frToggleScan').disabled = false;
    }
  });

  document.getElementById('frToggleScan').addEventListener('click', function () {
    syncConfig();
    engine.scanning = !engine.scanning;
    this.textContent = engine.scanning ? 'Stop Scanning' : 'Start Scanning';
    this.className = engine.scanning ? 'tm-btn' : 'tm-btn outline';
    logMsg('sys', engine.scanning ? 'Scanning started — detecting and recognizing faces' : 'Scanning paused');
  });

  document.getElementById('frAddPerson').addEventListener('click', () => {
    const name = prompt('Enter person name:');
    if (!name || !name.trim()) return;
    const id = engine.addPerson(name.trim());

    if (engine.scanning && engine.detections.length > 0) {
      const face = engine.detections[0];
      const desc = engine.extractDescriptor(engine.videoEl, face);
      const thumb = engine._cropThumbnail(engine.videoEl, face);
      engine.addSample(id, desc, thumb);
      logMsg('train', `First sample captured for "${name}" from live camera`);
    }
    renderPersonList();
  });

  document.getElementById('frExportDB').addEventListener('click', () => {
    const db = engine.exportDatabase();
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'synapex_facedb_' + Date.now() + '.json'; a.click();
    URL.revokeObjectURL(url);
    logMsg('sys', `Database exported: ${Object.keys(db.persons).length} persons`);
  });

  document.getElementById('frExportPy').addEventListener('click', () => {
    const code = engine.exportPythonCode();
    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'synapex_facedb.py'; a.click();
    URL.revokeObjectURL(url);
    logMsg('sys', 'Python database file exported');
  });

  function syncConfig() {
    const v = id => {
      const el = document.getElementById(id);
      return el ? (el.type === 'range' || el.type === 'number' ? parseFloat(el.value) : el.value) : undefined;
    };
    const c = id => { const el = document.getElementById(id); return el ? el.checked : false; };

    engine.config.minFaceSize = v('frMinFace') || 60;
    engine.config.scanInterval = v('frScanInterval') || 500;
    engine.config.matchThreshold = v('frMatchThresh') || 0.62;
    engine.config.maxSamplesPerPerson = v('frMaxSamples') || 50;
    engine.config.descriptorSize = v('frDescSize') || 256;
    engine.config.autoTrainEnabled = c('frAutoTrain');
    engine.config.autoScanOnDetect = c('frAutoScan');
    engine.config.detectionMethod = v('frDetMethod') || 'auto';
    engine.config.skinYMin = v('frSkinYMin') || 60;
    engine.config.skinYMax = v('frSkinYMax') || 255;
    engine.config.skinCbMin = v('frSkinCbMin') || 77;
    engine.config.skinCbMax = v('frSkinCbMax') || 127;
    engine.config.skinCrMin = v('frSkinCrMin') || 133;
    engine.config.skinCrMax = v('frSkinCrMax') || 173;
    engine.config.minRegionRatio = v('frMinRegion') || 0.008;
  }

  function renderPersonList() {
    const list = document.getElementById('frPersonList');
    const entries = Object.entries(engine.persons);
    if (!entries.length) {
      list.innerHTML = '<div style="text-align:center;padding:20px;font-family:\'DM Mono\',monospace;font-size:11px;color:var(--muted);">No persons in database.<br>Click "+ Add Person" then scan their face.</div>';
      return;
    }
    list.innerHTML = entries.map(([id, p]) => {
      const ago = p.lastSeen ? Math.round((Date.now() - p.lastSeen) / 1000) + 's ago' : 'never';
      return `<div class="fr-person-card" id="frP_${id}">
        <div class="fr-person-thumb">${p.thumbnail ? `<img src="${p.thumbnail}">` : ''}</div>
        <div class="fr-person-info">
          <div class="fr-person-name">${p.name}</div>
          <div class="fr-person-meta">${p.scanCount} scans · last: ${ago}</div>
          <div class="fr-person-meta">${p.samples.length} samples stored</div>
        </div>
        <button class="fr-person-del" data-pid="${id}">×</button>
      </div>`;
    }).join('');

    list.querySelectorAll('.fr-person-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        engine.removePerson(btn.dataset.pid);
        renderPersonList();
      });
    });
  }

  function logMsg(type, msg) {
    const log = document.getElementById('frLog');
    if (!log) return;
    const cls = { detect: 'ev-detect', match: 'ev-match', train: 'ev-train', warn: 'ev-warn', sys: 'ev-sys' }[type] || 'ev-sys';
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    log.innerHTML += `\n<span class="${cls}">[${time}]</span> ${msg}`;
    log.scrollTop = log.scrollHeight;
  }

  const cleanup = () => { if (engine && engine.running) engine.stopCamera(); };
  document.getElementById('toolModalClose').addEventListener('click', cleanup, { once: false });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cleanup(); }, { once: false });
};
