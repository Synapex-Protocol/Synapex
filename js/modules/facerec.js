/* SYNAPEX LAB — Face Recognition Module (Humanoid Robot Mode) */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initFaceRec = function (el) {
  var toggle = SynapexLab.toggle, range = SynapexLab.range, sel = SynapexLab.sel, wireRanges = SynapexLab.wireRanges;
  let engine = null;
  let controlsVisible = false;

  el.innerHTML = `
    <div class="fr-fullscreen-area" id="frFullscreenArea">
      <div class="fr-camera-fullscreen">
        <video id="frVideo" playsinline muted></video>
        <canvas id="frCanvas"></canvas>
        <div class="fr-camera-overlay" id="frOverlay">
          <div class="fr-camera-placeholder">Starting camera...</div>
        </div>
        <div class="fr-camera-corner-controls">
          <button class="fr-corner-btn" id="frTogglePanel" title="Panel">
            <span class="fr-icon">⚙</span>
          </button>
          <button class="fr-corner-btn" id="frSwitchCam" title="Kamera przód/tył">⇄</button>
          <span class="fr-fps-badge" id="frFps">0 FPS</span>
        </div>
      </div>

      <div class="fr-panel-overlay" id="frPanelOverlay"></div>
      <div class="fr-panel ${controlsVisible ? '' : 'collapsed'}" id="frPanel">
        <div class="fr-panel-header">
          <span>Face Recognition — Panel</span>
          <button class="fr-panel-close" id="frPanelClose">×</button>
        </div>
        <div class="fr-panel-body">
          <div class="fr-actions-bar">
            <button class="tm-btn" id="frStartCam">Start Camera</button>
            <button class="tm-btn outline" id="frToggleScan" disabled>Start Scanning</button>
            <button class="tm-btn outline" id="frAddPerson">+ Add Person</button>
            <button class="tm-btn outline" id="frSaveTrain">Save</button>
            <button class="tm-btn outline" id="frLoadTrain">Load</button>
            <button class="tm-btn outline" id="frExportDB">Export</button>
          </div>

          <div class="fr-live-area">
            <div class="fr-sidebar" id="frPersonList">
              <div class="fr-empty-msg">No persons. Add person then scan face.</div>
            </div>
          </div>

          <div class="tm-params">
            <div class="tm-params-title">Detection (auto-tuned)</div>
            ${range('frMinFace', 'Min Face Size', 40, 200, 80, 10, 'px')}
            ${range('frScanInterval', 'Scan Interval', 200, 1000, 400, 50, 'ms')}
            ${range('frMatchThresh', 'Match Threshold', 0.4, 0.9, 0.62, 0.02, '')}
            ${sel('frDetMethod', 'Method', [{v:'auto',t:'Auto (native preferred)',s:true},{v:'skin',t:'Skin color (fallback)'}])}
          </div>

          <div class="tm-section" style="margin-top:12px;">
            <div class="tm-heading">Log</div>
            <div class="fr-log" id="frLog"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  wireRanges(el);

  engine = new FaceRecEngine();
  if (engine.loadFromStorage()) setTimeout(renderPersonList, 0);
  engine.onLog = (type, msg) => logMsg(type, msg);
  engine.onSampleAdded = (personId, person) => {
    if (person.samples.length >= engine.config.minSamplesForTraining) {
      engine.saveToStorage();
      logMsg('train', `Auto-saved: "${person.name}" (${person.samples.length} samples)`);
    }
    renderPersonList();
  };

  const fpsEl = document.getElementById('frFps');
  setInterval(() => { if (engine && engine.running) fpsEl.textContent = engine.fps + ' FPS'; }, 500);

  engine.onRecognition = (match, face) => {
    const person = engine.persons[match.personId];
    if (person) renderPersonList();
  };

  function togglePanel() {
    controlsVisible = !controlsVisible;
    const panel = document.getElementById('frPanel');
    const overlay = document.getElementById('frPanelOverlay');
    panel.classList.toggle('collapsed', !controlsVisible);
    overlay.classList.toggle('visible', controlsVisible);
  }

  document.getElementById('frTogglePanel').addEventListener('click', togglePanel);
  document.getElementById('frPanelClose').addEventListener('click', () => {
    controlsVisible = false;
    document.getElementById('frPanel').classList.add('collapsed');
    document.getElementById('frPanelOverlay').classList.remove('visible');
  });
  document.getElementById('frPanelOverlay').addEventListener('click', () => {
    controlsVisible = false;
    document.getElementById('frPanel').classList.add('collapsed');
    document.getElementById('frPanelOverlay').classList.remove('visible');
  });

  document.getElementById('frSwitchCam').addEventListener('click', async () => {
    const vid = document.getElementById('frVideo');
    const can = document.getElementById('frCanvas');
    if (engine.running) {
      await engine.switchCamera(vid, can);
      logMsg('sys', 'Camera: ' + (engine.facingMode === 'user' ? 'front' : 'back'));
    }
  });

  document.getElementById('frStartCam').addEventListener('click', async function () {
    if (engine.running) {
      engine.stopCamera();
      this.textContent = 'Start Camera';
      document.getElementById('frOverlay').style.display = '';
      document.getElementById('frOverlay').querySelector('.fr-camera-placeholder').textContent = 'Camera stopped';
      document.getElementById('frToggleScan').disabled = true;
      return;
    }
    syncConfig();
    document.getElementById('frOverlay').querySelector('.fr-camera-placeholder').textContent = 'Starting...';
    document.getElementById('frOverlay').style.display = 'flex';
    const ok = await engine.startCamera(
      document.getElementById('frVideo'),
      document.getElementById('frCanvas'),
      { width: 1280, height: 720 }
    );
    if (ok) {
      document.getElementById('frOverlay').style.display = 'none';
      this.textContent = 'Stop Camera';
      document.getElementById('frToggleScan').disabled = false;
      engine.scanning = true;
      document.getElementById('frToggleScan').textContent = 'Stop Scanning';
      document.getElementById('frToggleScan').className = 'tm-btn';
      logMsg('sys', 'Autonomous mode: camera + scanning active');
    } else {
      document.getElementById('frOverlay').querySelector('.fr-camera-placeholder').textContent = 'Camera error. Click Start.';
    }
  });

  document.getElementById('frToggleScan').addEventListener('click', function () {
    syncConfig();
    engine.scanning = !engine.scanning;
    this.textContent = engine.scanning ? 'Stop Scanning' : 'Start Scanning';
    this.className = engine.scanning ? 'tm-btn' : 'tm-btn outline';
    logMsg('sys', engine.scanning ? 'Scanning active' : 'Scanning paused');
  });

  document.getElementById('frAddPerson').addEventListener('click', () => {
    const name = prompt('Person name:');
    if (!name || !name.trim()) return;
    const id = engine.addPerson(name.trim());
    if (engine.scanning && engine.detections.length > 0) {
      engine.startCollectionForPerson(id);
      const face = engine.detections[0];
      const desc = engine.extractDescriptor(engine.videoEl, face);
      const thumb = engine._cropThumbnail(engine.videoEl, face);
      engine.addSample(id, desc, thumb, face.trackId);
      logMsg('train', `First sample for "${name}"`);
    }
    renderPersonList();
  });

  document.getElementById('frSaveTrain').addEventListener('click', () => {
    syncConfig();
    if (engine.saveToStorage()) logMsg('sys', 'Saved');
    renderPersonList();
  });

  document.getElementById('frLoadTrain').addEventListener('click', () => {
    syncConfig();
    if (engine.loadFromStorage()) {
      renderPersonList();
      logMsg('sys', 'Loaded');
    } else logMsg('warn', 'No saved data');
  });

  document.getElementById('frExportDB').addEventListener('click', () => {
    const db = engine.exportDatabase();
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'synapex_facedb_' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    logMsg('sys', 'Exported');
  });

  function syncConfig() {
    const v = id => {
      const el = document.getElementById(id);
      return el ? (el.type === 'range' || el.type === 'number' ? parseFloat(el.value) : el.value) : undefined;
    };
    engine.config.minFaceSize = v('frMinFace') || 80;
    engine.config.scanInterval = v('frScanInterval') || 400;
    engine.config.matchThreshold = v('frMatchThresh') || 0.62;
    engine.config.detectionMethod = v('frDetMethod') || 'auto';
  }

  function renderPersonList() {
    const list = document.getElementById('frPersonList');
    const entries = Object.entries(engine.persons);
    if (!entries.length) {
      list.innerHTML = '<div class="fr-empty-msg">No persons. Add person then scan face.</div>';
      return;
    }
    const activeId = engine.activeCollectionPersonId;
    list.innerHTML = entries.map(([id, p]) => {
      const ago = p.lastSeen ? Math.round((Date.now() - p.lastSeen) / 1000) + 's' : '-';
      const isCollecting = activeId === id;
      return `<div class="fr-person-card ${isCollecting ? 'collecting' : ''}">
        <div class="fr-person-thumb">${p.thumbnail ? `<img src="${p.thumbnail}">` : ''}</div>
        <div class="fr-person-info">
          <div class="fr-person-name">${p.name}</div>
          <div class="fr-person-meta">${p.samples.length} samples · ${ago}</div>
          <button class="fr-collect-btn" data-pid="${id}">${isCollecting ? 'Stop' : 'Collect'}</button>
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
    list.querySelectorAll('.fr-collect-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.dataset.pid;
        if (engine.activeCollectionPersonId === pid) {
          engine.stopCollection();
        } else engine.startCollectionForPerson(pid);
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

  logMsg('sys', 'Face Recognition ready. Autonomous mode for humanoid robot.');

  setTimeout(async () => {
    syncConfig();
    document.getElementById('frOverlay').querySelector('.fr-camera-placeholder').textContent = 'Auto-starting camera...';
    const ok = await engine.startCamera(
      document.getElementById('frVideo'),
      document.getElementById('frCanvas'),
      { width: 1280, height: 720 }
    );
    if (ok) {
      document.getElementById('frOverlay').style.display = 'none';
      document.getElementById('frStartCam').textContent = 'Stop Camera';
      document.getElementById('frToggleScan').disabled = false;
      engine.scanning = true;
      document.getElementById('frToggleScan').textContent = 'Stop Scanning';
      document.getElementById('frToggleScan').className = 'tm-btn';
      logMsg('sys', 'Autonomous: camera + scanning running');
    } else {
      document.getElementById('frOverlay').querySelector('.fr-camera-placeholder').textContent = 'Click "Start Camera" to begin';
      logMsg('warn', 'Auto-start failed. Click Start Camera.');
    }
  }, 300);

  const cleanup = () => { if (engine && engine.running) engine.stopCamera(); };
  document.getElementById('toolModalClose')?.addEventListener('click', cleanup, { once: false });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cleanup(); }, { once: false });
};
