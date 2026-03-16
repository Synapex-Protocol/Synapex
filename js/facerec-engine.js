/* ═══════════════════════════════════════════════════
   SYNAPEX Face Recognition Engine
   Pure JavaScript — designed for easy Python porting
   
   Python equivalent structure:
     class FaceRecEngine:
         def __init__(self, config)
         def detect_faces(self, frame) -> List[FaceDetection]
         def extract_descriptor(self, face_crop) -> np.ndarray
         def compare(self, desc_a, desc_b) -> float
         def recognize(self, descriptor) -> (person_id, similarity)
         def add_sample(self, person_id, descriptor, thumbnail)
         def export_database(self) -> dict
   ═══════════════════════════════════════════════════ */

class FaceRecEngine {
  constructor(config = {}) {
    this.config = {
      minFaceSize: 60,
      scanInterval: 500,
      matchThreshold: 0.62,
      maxSamplesPerPerson: 50,
      descriptorSize: 256,
      autoTrainEnabled: true,
      autoScanOnDetect: true,
      minSamplesForTraining: 5,
      minQualityScore: 0.5,
      skinYMin: 60, skinYMax: 255,
      skinCbMin: 77, skinCbMax: 127,
      skinCrMin: 133, skinCrMax: 173,
      morphKernel: 5,
      minRegionRatio: 0.008,
      detectionMethod: 'auto',
      trackMaxDistance: 80,
      ...config
    };

    this.persons = {};
    this.nextPersonId = 1;
    this.running = false;
    this.scanning = false;
    this.trackedFaces = [];
    this.activeCollectionTrackId = null;
    this.activeCollectionPersonId = null;
    this.videoEl = null;
    this.canvasEl = null;
    this.ctx = null;
    this.workCanvas = null;
    this.workCtx = null;
    this.lastScanTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsTime = 0;
    this.detections = [];
    this.nativeFaceDetector = null;
    this.onDetection = null;
    this.onRecognition = null;
    this.onLog = null;
    this.animFrameId = null;

    this._initNativeDetector();
  }

  async _initNativeDetector() {
    if (this.config.detectionMethod === 'skin') return;
    try {
      if ('FaceDetector' in window) {
        this.nativeFaceDetector = new FaceDetector({
          maxDetectedFaces: 10,
          fastMode: true
        });
        this._log('sys', 'Native FaceDetector API available');
      }
    } catch (e) {
      this.nativeFaceDetector = null;
    }
  }

  /* ── CAMERA ────────────────────────────────── */

  async startCamera(videoEl, canvasEl) {
    this.videoEl = videoEl;
    this.canvasEl = canvasEl;
    this.ctx = canvasEl.getContext('2d', { willReadFrequently: true });

    this.workCanvas = document.createElement('canvas');
    this.workCtx = this.workCanvas.getContext('2d', { willReadFrequently: true });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      videoEl.srcObject = stream;
      await videoEl.play();
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      this.workCanvas.width = videoEl.videoWidth;
      this.workCanvas.height = videoEl.videoHeight;
      this.running = true;
      this._log('sys', `Camera started: ${videoEl.videoWidth}x${videoEl.videoHeight}`);
      this._loop();
      return true;
    } catch (e) {
      this._log('warn', 'Camera access denied: ' + e.message);
      return false;
    }
  }

  stopCamera() {
    this.running = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.videoEl && this.videoEl.srcObject) {
      this.videoEl.srcObject.getTracks().forEach(t => t.stop());
      this.videoEl.srcObject = null;
    }
    this._log('sys', 'Camera stopped');
  }

  _loop() {
    if (!this.running) return;
    this.animFrameId = requestAnimationFrame(() => this._loop());

    this.frameCount++;
    const now = performance.now();
    if (now - this.fpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = now;
    }

    this._processFrame(now);
  }

  async _processFrame(now) {
    const v = this.videoEl;
    if (!v || v.readyState < 2) return;

    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

    const shouldScan = this.scanning && (now - this.lastScanTime >= this.config.scanInterval);

    let faces;
    if (this.nativeFaceDetector && this.config.detectionMethod !== 'skin') {
      faces = await this._detectNative(v);
    } else {
      faces = this._detectSkinColor(v);
    }

    this._updateFaceTracks(faces);
    this.detections = faces;

    faces.forEach((face, i) => {
      this._drawFaceBox(face, i);

      if (shouldScan) {
        const descriptor = this.extractDescriptor(v, face);
        const match = this.recognize(descriptor);
        face.descriptor = descriptor;
        face.match = match;

        const quality = this._computeSampleQuality(v, face, descriptor);
        face.quality = quality;

        if (this.onDetection) this.onDetection(face);

        const canAddSample = this._canAddSampleForFace(face);
        if (match.personId && match.similarity >= this.config.matchThreshold) {
          if (this.config.autoTrainEnabled && canAddSample && quality >= this.config.minQualityScore) {
            this.addSample(match.personId, descriptor, this._cropThumbnail(v, face), face.trackId);
          }
          if (this.onRecognition) this.onRecognition(match, face);
          this._drawLabel(face, this.persons[match.personId].name, match.similarity);
        } else {
          if (this.activeCollectionPersonId && canAddSample && quality >= this.config.minQualityScore) {
            this.addSample(this.activeCollectionPersonId, descriptor, this._cropThumbnail(v, face), face.trackId);
          }
          this._drawLabel(face, 'Unknown', match.similarity);
        }
      } else {
        this._drawFaceBox(face, i, true);
      }
    });

    this._drawScanIndicator();

    if (shouldScan) this.lastScanTime = now;
  }

  _updateFaceTracks(faces) {
    const maxDist = this.config.trackMaxDistance;
    const prev = this.trackedFaces;
    const next = [];

    for (const face of faces) {
      const cx = face.x + face.w / 2;
      const cy = face.y + face.h / 2;

      let bestIdx = -1;
      let bestDist = maxDist;

      for (let i = 0; i < prev.length; i++) {
        const p = prev[i];
        const dist = Math.hypot(cx - p.cx, cy - p.cy);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }

      const trackId = bestIdx >= 0 ? prev[bestIdx].trackId : Date.now() + '_' + Math.random().toString(36).slice(2);
      face.trackId = trackId;
      next.push({ trackId, cx, cy });
    }

    this.trackedFaces = next.slice(0, 10);
  }

  _canAddSampleForFace(face) {
    if (!this.activeCollectionPersonId || !this.activeCollectionTrackId) return true;
    return face.trackId === this.activeCollectionTrackId;
  }

  _computeSampleQuality(source, face, descriptor) {
    let score = 0.5;
    const c = this.workCanvas;
    const ctx = this.workCtx;
    const size = 64;
    c.width = size;
    c.height = size;
    ctx.drawImage(source, face.x, face.y, face.w, face.h, 0, 0, size, size);
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    let sumBright = 0, sumSq = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sumBright += g;
      sumSq += g * g;
      n++;
    }
    const mean = sumBright / n;
    const variance = (sumSq / n) - (mean * mean);
    if (mean >= 40 && mean <= 200) score += 0.2;
    if (variance > 100) score += 0.2;
    if (face.w >= this.config.minFaceSize * 1.2) score += 0.1;
    if (face.confidence > 0.8) score += 0.1;

    c.width = this.videoEl ? this.videoEl.videoWidth : 640;
    c.height = this.videoEl ? this.videoEl.videoHeight : 480;
    return Math.min(1, score);
  }

  /* ── DETECTION: Native FaceDetector API ───── */

  async _detectNative(source) {
    try {
      const results = await this.nativeFaceDetector.detect(source);
      return results
        .filter(r => r.boundingBox.width >= this.config.minFaceSize)
        .map(r => ({
          x: Math.round(r.boundingBox.x),
          y: Math.round(r.boundingBox.y),
          w: Math.round(r.boundingBox.width),
          h: Math.round(r.boundingBox.height),
          confidence: 0.95,
          method: 'native'
        }));
    } catch {
      return this._detectSkinColor(source);
    }
  }

  /* ── DETECTION: Skin Color Segmentation ───── */
  /*  Python equivalent:
      def detect_skin_color(self, frame):
          ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
          mask = cv2.inRange(ycrcb, (y_min, cr_min, cb_min), (y_max, cr_max, cb_max))
          contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
          faces = [cv2.boundingRect(c) for c in contours if cv2.contourArea(c) > min_area]
          return faces
  */

  _detectSkinColor(source) {
    const w = this.workCanvas.width;
    const h = this.workCanvas.height;
    this.workCtx.drawImage(source, 0, 0, w, h);
    const imageData = this.workCtx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const cfg = this.config;

    const mask = new Uint8Array(w * h);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const y  = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.169 * r - 0.331 * g + 0.500 * b;
      const cr = 128 + 0.500 * r - 0.419 * g - 0.081 * b;

      const px = (i / 4) | 0;
      if (y >= cfg.skinYMin && y <= cfg.skinYMax &&
          cb >= cfg.skinCbMin && cb <= cfg.skinCbMax &&
          cr >= cfg.skinCrMin && cr <= cfg.skinCrMax) {
        mask[px] = 1;
      }
    }

    const regions = this._findConnectedRegions(mask, w, h);
    const minArea = w * h * cfg.minRegionRatio;

    return regions
      .filter(r => {
        if (r.area < minArea) return false;
        if (r.w < cfg.minFaceSize || r.h < cfg.minFaceSize) return false;
        const aspect = r.w / r.h;
        return aspect > 0.5 && aspect < 1.8;
      })
      .map(r => ({
        x: r.x, y: r.y, w: r.w, h: r.h,
        confidence: Math.min(0.95, 0.5 + (r.density * 0.6)),
        method: 'skin'
      }))
      .slice(0, 10);
  }

  _findConnectedRegions(mask, w, h) {
    const visited = new Uint8Array(w * h);
    const regions = [];

    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const idx = y * w + x;
        if (mask[idx] && !visited[idx]) {
          const region = this._floodFill(mask, visited, w, h, x, y);
          if (region) regions.push(region);
        }
      }
    }
    return regions.sort((a, b) => b.area - a.area);
  }

  _floodFill(mask, visited, w, h, sx, sy) {
    const stack = [[sx, sy]];
    let minX = sx, maxX = sx, minY = sy, maxY = sy;
    let count = 0;

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const idx = y * w + x;
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      if (visited[idx] || !mask[idx]) continue;

      visited[idx] = 1;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      stack.push([x + 4, y], [x - 4, y], [x, y + 4], [x, y - 4]);
    }

    if (count < 20) return null;
    const bw = maxX - minX;
    const bh = maxY - minY;
    return { x: minX, y: minY, w: bw, h: bh, area: count * 16, density: count / ((bw * bh) / 16 || 1) };
  }

  /* ── DESCRIPTOR EXTRACTION ─────────────────── */
  /*  Python equivalent:
      def extract_descriptor(self, frame, face_bbox):
          crop = frame[y:y+h, x:x+w]
          gray = cv2.cvtColor(cv2.resize(crop, (64,64)), cv2.COLOR_BGR2GRAY)
          lbp = local_binary_pattern(gray, 8, 1, method='uniform')
          hist, _ = np.histogram(lbp, bins=self.descriptor_size, density=True)
          return hist.astype(np.float32)
  */

  extractDescriptor(source, face) {
    const size = 64;
    const c = this.workCanvas;
    const ctx = this.workCtx;
    c.width = size;
    c.height = size;
    ctx.drawImage(
      source instanceof HTMLVideoElement ? source : source,
      face.x, face.y, face.w, face.h,
      0, 0, size, size
    );
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    const gray = new Float32Array(size * size);
    for (let i = 0; i < gray.length; i++) {
      gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    }

    const descriptor = this._computeLBPHistogram(gray, size, size);

    c.width = this.videoEl ? this.videoEl.videoWidth : 640;
    c.height = this.videoEl ? this.videoEl.videoHeight : 480;

    return descriptor;
  }

  _computeLBPHistogram(gray, w, h) {
    const bins = this.config.descriptorSize;
    const hist = new Float32Array(bins);
    const cellsX = 4, cellsY = 4;
    const cellW = (w / cellsX) | 0;
    const cellH = (h / cellsY) | 0;
    const binsPerCell = (bins / (cellsX * cellsY)) | 0;

    for (let cy = 0; cy < cellsY; cy++) {
      for (let cx = 0; cx < cellsX; cx++) {
        const cellHist = new Float32Array(binsPerCell);
        const startX = cx * cellW + 1;
        const startY = cy * cellH + 1;
        const endX = Math.min(startX + cellW - 2, w - 1);
        const endY = Math.min(startY + cellH - 2, h - 1);

        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const center = gray[y * w + x];
            let code = 0;
            if (gray[(y - 1) * w + (x - 1)] >= center) code |= 1;
            if (gray[(y - 1) * w + x]       >= center) code |= 2;
            if (gray[(y - 1) * w + (x + 1)] >= center) code |= 4;
            if (gray[y * w + (x + 1)]       >= center) code |= 8;
            if (gray[(y + 1) * w + (x + 1)] >= center) code |= 16;
            if (gray[(y + 1) * w + x]       >= center) code |= 32;
            if (gray[(y + 1) * w + (x - 1)] >= center) code |= 64;
            if (gray[y * w + (x - 1)]       >= center) code |= 128;

            cellHist[code % binsPerCell]++;
          }
        }

        let sum = 0;
        for (let i = 0; i < binsPerCell; i++) sum += cellHist[i];
        if (sum > 0) for (let i = 0; i < binsPerCell; i++) cellHist[i] /= sum;

        const offset = (cy * cellsX + cx) * binsPerCell;
        for (let i = 0; i < binsPerCell; i++) hist[offset + i] = cellHist[i];
      }
    }

    return hist;
  }

  /* ── COMPARISON ────────────────────────────── */
  /*  Python: np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))  */

  compare(descA, descB) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < descA.length; i++) {
      dot += descA[i] * descB[i];
      normA += descA[i] * descA[i];
      normB += descB[i] * descB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0;
  }

  /* ── RECOGNITION ───────────────────────────── */
  /*  Python:
      def recognize(self, descriptor):
          best_id, best_sim = None, 0
          for pid, person in self.persons.items():
              sim = self.compare(descriptor, person['mean_descriptor'])
              if sim > best_sim: best_id, best_sim = pid, sim
          return best_id, best_sim
  */

  recognize(descriptor) {
    let bestId = null, bestSim = 0;
    for (const [pid, person] of Object.entries(this.persons)) {
      if (!person.meanDescriptor) continue;
      const sim = this.compare(descriptor, person.meanDescriptor);
      if (sim > bestSim) {
        bestId = pid;
        bestSim = sim;
      }
    }
    return { personId: bestId, similarity: bestSim };
  }

  /* ── PERSON DATABASE ───────────────────────── */

  addPerson(name) {
    const id = 'p' + this.nextPersonId++;
    this.persons[id] = {
      name: name,
      samples: [],
      meanDescriptor: null,
      thumbnail: null,
      createdAt: Date.now(),
      lastSeen: null,
      scanCount: 0
    };
    this._log('sys', `Person added: "${name}" (${id})`);
    return id;
  }

  removePerson(personId) {
    const name = this.persons[personId]?.name || personId;
    delete this.persons[personId];
    this._log('sys', `Person removed: "${name}"`);
  }

  addSample(personId, descriptor, thumbnail, trackId) {
    const person = this.persons[personId];
    if (!person) return;

    if (!this.activeCollectionPersonId || this.activeCollectionPersonId !== personId) {
      this.activeCollectionPersonId = personId;
      this.activeCollectionTrackId = trackId || null;
    }
    if (trackId && !this.activeCollectionTrackId) this.activeCollectionTrackId = trackId;

    if (person.samples.length >= this.config.maxSamplesPerPerson) {
      person.samples.shift();
    }

    person.samples.push({ descriptor: Array.from(descriptor), timestamp: Date.now() });
    person.scanCount++;
    person.lastSeen = Date.now();
    if (thumbnail) person.thumbnail = thumbnail;

    this._recomputeMean(personId);
    if (this.onSampleAdded) this.onSampleAdded(personId, person);
  }

  _recomputeMean(personId) {
    const person = this.persons[personId];
    if (!person || person.samples.length === 0) return;

    const len = person.samples[0].descriptor.length;
    const mean = new Float32Array(len);

    for (const sample of person.samples) {
      for (let i = 0; i < len; i++) mean[i] += sample.descriptor[i];
    }
    const n = person.samples.length;
    for (let i = 0; i < len; i++) mean[i] /= n;

    person.meanDescriptor = mean;
  }

  /* ── DRAWING ───────────────────────────────── */

  _drawFaceBox(face, index, detectOnly = false) {
    const ctx = this.ctx;
    const isMatched = !detectOnly && face.match && face.match.personId && face.match.similarity >= this.config.matchThreshold;
    const isTracked = face.trackId === this.activeCollectionTrackId;
    let color = isMatched ? '#00d4a8' : '#4a8cff';
    if (isTracked) color = '#f0b429';

    ctx.strokeStyle = color;
    ctx.lineWidth = detectOnly ? 1.5 : 2.5;
    ctx.setLineDash([]);

    const cornerLen = 14;
    const x = face.x, y = face.y, w = face.w, h = face.h;

    ctx.beginPath();
    ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y);
    ctx.moveTo(x + w - cornerLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerLen);
    ctx.moveTo(x + w, y + h - cornerLen); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - cornerLen, y + h);
    ctx.moveTo(x + cornerLen, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - cornerLen);
    ctx.stroke();

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = color + '66';
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }

  _drawScanIndicator() {
    if (!this.scanning || !this.ctx) return;
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,212,168,0.25)';
    ctx.fillRect(0, 0, this.canvasEl.width, 3);
  }

  _drawLabel(face, text, similarity) {
    const ctx = this.ctx;
    const isKnown = text !== 'Unknown';
    const color = isKnown ? '#00d4a8' : '#4a8cff';
    const label = `${text} (${(similarity * 100).toFixed(0)}%)`;

    ctx.font = '11px "DM Mono", monospace';
    const metrics = ctx.measureText(label);
    const lw = metrics.width + 12;
    const lh = 20;
    const lx = face.x;
    const ly = face.y - lh - 4;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.roundRect(lx, ly, lw, lh, 4);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.fillText(label, lx + 6, ly + 14);
  }

  _cropThumbnail(source, face) {
    const tc = document.createElement('canvas');
    tc.width = 64;
    tc.height = 64;
    const tctx = tc.getContext('2d');
    tctx.drawImage(source, face.x, face.y, face.w, face.h, 0, 0, 64, 64);
    return tc.toDataURL('image/jpeg', 0.7);
  }

  /* ── PERSISTENCE (save/load for incremental training) ── */
  static STORAGE_KEY = 'synapex_facerec_db';

  saveToStorage() {
    const db = this.exportDatabase();
    try {
      localStorage.setItem(FaceRecEngine.STORAGE_KEY, JSON.stringify(db));
      this._log('sys', 'Training data saved to browser storage');
      return true;
    } catch (e) {
      this._log('warn', 'Could not save: ' + e.message);
      return false;
    }
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(FaceRecEngine.STORAGE_KEY);
      if (!raw) return false;
      const db = JSON.parse(raw);
      this.importDatabase(db);
      this._log('sys', 'Training data loaded from browser storage');
      return true;
    } catch (e) {
      this._log('warn', 'Could not load: ' + e.message);
      return false;
    }
  }

  importDatabase(db) {
    if (!db || !db.persons) return;
    let maxId = 0;
    for (const id of Object.keys(db.persons)) {
      const m = id.match(/^p(\d+)$/);
      if (m) maxId = Math.max(maxId, parseInt(m[1], 10));
    }
    this.nextPersonId = maxId + 1;

    for (const [id, data] of Object.entries(db.persons)) {
      this.persons[id] = {
        name: data.name,
        samples: data.samples || [],
        meanDescriptor: data.mean_descriptor ? new Float32Array(data.mean_descriptor) : null,
        thumbnail: data.thumbnail || null,
        createdAt: data.created_at || Date.now(),
        lastSeen: data.last_seen || null,
        scanCount: data.scan_count || (data.samples ? data.samples.length : 0)
      };
      if (!this.persons[id].meanDescriptor && this.persons[id].samples.length > 0) {
        this._recomputeMean(id);
      }
    }
  }

  startCollectionForPerson(personId) {
    this.activeCollectionPersonId = personId;
    this.activeCollectionTrackId = null;
  }

  stopCollection() {
    this.activeCollectionPersonId = null;
    this.activeCollectionTrackId = null;
  }

  /* ── EXPORT ────────────────────────────────── */
  /*  Output format matches Python dict structure:
      { "persons": { "p1": { "name": "...", "samples": [...], "mean_descriptor": [...] } }, "config": {...} }
  */

  exportDatabase() {
    const db = { persons: {}, config: { ...this.config }, exportedAt: new Date().toISOString() };
    for (const [id, person] of Object.entries(this.persons)) {
      db.persons[id] = {
        name: person.name,
        samples: person.samples,
        mean_descriptor: person.meanDescriptor ? Array.from(person.meanDescriptor) : null,
        thumbnail: person.thumbnail || null,
        scan_count: person.scanCount,
        created_at: person.createdAt,
        last_seen: person.lastSeen
      };
    }
    return db;
  }

  exportPythonCode() {
    const db = this.exportDatabase();
    return `# SYNAPEX Face Recognition — Python Import
# Generated: ${db.exportedAt}
# Persons: ${Object.keys(db.persons).length}

import numpy as np
import json

DATABASE = json.loads('''${JSON.stringify(db)}''')

class FaceRecDB:
    def __init__(self):
        self.persons = {}
        for pid, data in DATABASE['persons'].items():
            self.persons[pid] = {
                'name': data['name'],
                'mean_descriptor': np.array(data['mean_descriptor'], dtype=np.float32) if data['mean_descriptor'] else None,
                'samples': [np.array(s['descriptor'], dtype=np.float32) for s in data['samples']],
                'scan_count': data['scan_count']
            }

    def recognize(self, descriptor, threshold=0.62):
        best_id, best_sim = None, 0.0
        for pid, person in self.persons.items():
            if person['mean_descriptor'] is None:
                continue
            sim = float(np.dot(descriptor, person['mean_descriptor']) /
                       (np.linalg.norm(descriptor) * np.linalg.norm(person['mean_descriptor']) + 1e-8))
            if sim > best_sim:
                best_id, best_sim = pid, sim
        if best_sim >= threshold:
            return best_id, self.persons[best_id]['name'], best_sim
        return None, 'Unknown', best_sim

# Usage with OpenCV:
# import cv2
# cap = cv2.VideoCapture(0)
# db = FaceRecDB()
# ret, frame = cap.read()
# # ... detect face, extract LBP descriptor ...
# person_id, name, similarity = db.recognize(descriptor)
`;
  }

  /* ── LOGGING ───────────────────────────────── */

  _log(type, msg) {
    if (this.onLog) this.onLog(type, msg);
  }
}

window.FaceRecEngine = FaceRecEngine;
