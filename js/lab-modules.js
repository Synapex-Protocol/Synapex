/* ═══════════════════════════════════════════════════
   SYNAPEX LAB — AI Module Programs (Modal)
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  const cards = document.querySelectorAll('.module-clickable[data-module]');
  const backdrop = document.getElementById('toolModalBackdrop');
  const body = document.getElementById('toolModalBody');
  const iconEl = document.getElementById('toolModalIcon');
  const titleEl = document.getElementById('toolModalTitle');
  const subtitleEl = document.getElementById('toolModalSubtitle');
  const closeBtn = document.getElementById('toolModalClose');

  if (!cards.length || !backdrop) return;

  const MODULES = {
    facerec:  { icon: '\u{1F575}', title: 'Face Recognition',   sub: 'Module Configuration',  init: initFaceRec },
    facescan: { icon: '\u{1F9F9}', title: '3D Face Scanning',   sub: 'Reconstruction Pipeline', init: initFaceScan },
    objdet:   { icon: '\u{1F441}', title: 'Object Detection',   sub: 'Detection Engine',        init: initObjDet },
    pose:     { icon: '\u{1F464}', title: 'Pose Estimation',    sub: 'Skeleton Tracker',         init: initPose },
    speech:   { icon: '\u{1F5E3}', title: 'Speech Recognition', sub: 'ASR Pipeline',             init: initSpeech },
    scene:    { icon: '\u{1F3AC}', title: 'Scene Understanding',sub: 'Panoptic Analysis',        init: initScene }
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.module;
      const m = MODULES[key];
      if (!m) return;
      iconEl.textContent = m.icon;
      titleEl.textContent = m.title;
      subtitleEl.textContent = m.sub;
      body.innerHTML = '';
      m.init(body);
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => backdrop.classList.add('visible'));
      });
    });
  });

  function toggle(id, label, sub, checked) {
    return `<div class="tm-toggle-row">
      <div><div class="tm-toggle-text">${label}</div>${sub ? `<div class="tm-toggle-sub">${sub}</div>` : ''}</div>
      <label class="tm-toggle"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''}><span class="tm-toggle-track"></span><span class="tm-toggle-thumb"></span></label>
    </div>`;
  }

  function range(id, label, min, max, val, step, unit) {
    return `<div class="tm-param-row">
      <span class="tm-param-label">${label}</span>
      <div class="tm-param-ctrl">
        <div class="tm-range-wrap">
          <input type="range" class="tm-range" id="${id}" min="${min}" max="${max}" value="${val}" step="${step || 1}">
          <span class="tm-range-val" id="${id}Val">${val}${unit || ''}</span>
        </div>
      </div>
    </div>`;
  }

  function sel(id, label, options) {
    return `<div class="tm-param-row">
      <span class="tm-param-label">${label}</span>
      <div class="tm-param-ctrl">
        <select class="tm-input" id="${id}">${options.map(o => {
          const v = typeof o === 'string' ? o : o.v;
          const t = typeof o === 'string' ? o : o.t;
          const s = typeof o === 'object' && o.s ? ' selected' : '';
          return `<option value="${v}"${s}>${t}</option>`;
        }).join('')}</select>
      </div>
    </div>`;
  }

  function num(id, label, val, min, max, step) {
    return `<div class="tm-param-row">
      <span class="tm-param-label">${label}</span>
      <div class="tm-param-ctrl">
        <input type="number" class="tm-input" id="${id}" value="${val}" min="${min}" max="${max}" step="${step || 1}">
      </div>
    </div>`;
  }

  function wireRanges(el) {
    el.querySelectorAll('.tm-range').forEach(r => {
      const valEl = document.getElementById(r.id + 'Val');
      if (!valEl) return;
      const unit = valEl.textContent.replace(/[\d.\-]/g, '');
      r.addEventListener('input', () => { valEl.textContent = r.value + unit; });
    });
  }

  /* ═════════════════════════════════════════════════
     1. FACE RECOGNITION
     ═════════════════════════════════════════════════ */
  function initFaceRec(el) {
    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">99.4%</div><div class="tm-stat-lbl">LFW Accuracy</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">120</div><div class="tm-stat-lbl">FPS (RTX 4090)</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">54M</div><div class="tm-stat-lbl">Parameters</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">215 MB</div><div class="tm-stat-lbl">Model Size</div></div>
      </div>

      <div class="tm-split">
        <div>
          <div class="tm-params">
            <div class="tm-params-title">Detection Parameters</div>
            ${range('frMinFace', 'Minimum Face Size (px)', 10, 200, 40, 5, 'px')}
            ${range('frConfidence', 'Detection Confidence Threshold', 0.1, 0.99, 0.85, 0.01, '')}
            ${range('frNmsThresh', 'NMS IoU Threshold', 0.1, 0.9, 0.45, 0.05, '')}
            ${sel('frBackbone', 'Backbone Network', ['ResNet-50','ResNet-101',{v:'MobileNetV3',t:'MobileNetV3 (Edge)',s:false},'EfficientNet-B4'])}
            ${range('frMaxFaces', 'Max Faces per Frame', 1, 100, 20, 1, '')}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Recognition Settings</div>
            ${sel('frEmbedding', 'Embedding Dimension', ['128','256',{v:'512',t:'512 (recommended)',s:true},'1024'])}
            ${range('frMatchThresh', 'Match Similarity Threshold', 0.3, 0.95, 0.72, 0.01, '')}
            ${sel('frMetric', 'Distance Metric', [{v:'cosine',t:'Cosine Similarity',s:true},'Euclidean L2','Manhattan L1'])}
            ${sel('frAlign', 'Face Alignment', [{v:'5point',t:'5-point Landmarks',s:true},'68-point Landmarks','3D Alignment (PNCC)'])}
          </div>
        </div>

        <div>
          <div class="tm-params">
            <div class="tm-params-title">Preprocessing Pipeline</div>
            ${toggle('frLowLight', 'Low-Light Enhancement', 'CLAHE adaptive histogram equalization', true)}
            ${toggle('frAntiSpoof', 'Anti-Spoofing Detection', 'Liveness check via depth + texture analysis', true)}
            ${toggle('frGenderAge', 'Gender & Age Estimation', 'Auxiliary head for demographic attributes', false)}
            ${toggle('frEmotion', 'Expression Classification', '7-class FER model (happy, sad, angry, ...)', false)}
            ${toggle('frMask', 'Masked Face Support', 'Partial occlusion handling for masked faces', true)}
            ${toggle('frAugment', 'Test-Time Augmentation', 'Multi-crop + flip ensemble at inference', false)}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Deployment</div>
            ${sel('frTarget', 'Target Platform', [{v:'cloud',t:'Cloud (GPU)',s:true},'Edge (TensorRT)','Mobile (CoreML)','WASM (Browser)'])}
            ${sel('frPrecision', 'Precision', ['FP32',{v:'FP16',t:'FP16 (recommended)',s:true},'INT8 (quantized)'])}
            ${sel('frBatch', 'Batch Size', ['1','4',{v:'8',t:'8',s:true},'16','32'])}
          </div>
        </div>
      </div>

      <div class="tm-section" style="margin-top:24px;">
        <div class="tm-heading">API Endpoint Preview</div>
        <div class="tm-console"><span class="dim">POST</span> <span class="hl">https://api.synapex.io/v1/face/recognize</span>

<span class="dim">Headers:</span>
  Authorization: Bearer <span class="hg">$SYNX_API_KEY</span>
  Content-Type: multipart/form-data

<span class="dim">Body:</span>
  image: <span class="hp">[binary]</span>
  min_face_size: <span class="hl2">40</span>
  confidence_threshold: <span class="hl2">0.85</span>
  max_faces: <span class="hl2">20</span>
  return_embeddings: <span class="hl2">true</span>
  anti_spoof: <span class="hl2">true</span>

<span class="dim">Response (200):</span>
{
  "faces_detected": <span class="hl2">3</span>,
  "inference_ms": <span class="hl2">8.4</span>,
  "results": [
    {
      "bbox": [<span class="hl">102, 84, 287, 341</span>],
      "confidence": <span class="hl2">0.9987</span>,
      "identity": <span class="hp">"person_0042"</span>,
      "similarity": <span class="hl2">0.891</span>,
      "liveness": <span class="hl2">0.997</span>,
      "landmarks_5pt": [[<span class="hl">...</span>]]
    }
  ]
}</div>
      </div>

      <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
        <button class="tm-btn">Deploy Module</button>
        <button class="tm-btn outline">Export Config</button>
        <button class="tm-btn outline">Run Benchmark</button>
      </div>
    `;
    wireRanges(el);
  }

  /* ═════════════════════════════════════════════════
     2. 3D FACE SCANNING
     ═════════════════════════════════════════════════ */
  function initFaceScan(el) {
    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">68</div><div class="tm-stat-lbl">Landmark Points</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">45</div><div class="tm-stat-lbl">FPS Realtime</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">0.3mm</div><div class="tm-stat-lbl">Depth Precision</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">128 MB</div><div class="tm-stat-lbl">Model Size</div></div>
      </div>

      <div class="tm-split">
        <div>
          <div class="tm-params">
            <div class="tm-params-title">Reconstruction Parameters</div>
            ${sel('fsInput', 'Input Source', [{v:'rgbd',t:'RGB-D Camera',s:true},'Stereo Pair','Monocular RGB (estimated depth)','Structured Light'])}
            ${range('fsMeshRes', 'Mesh Resolution (vertices)', 1000, 50000, 15000, 1000, '')}
            ${range('fsDepthRange', 'Depth Range (mm)', 100, 2000, 600, 50, 'mm')}
            ${sel('fsTopology', 'Mesh Topology', ['Irregular Triangles',{v:'quad',t:'Quad-dominant (retopologized)',s:true},'FLAME template fitting'])}
            ${range('fsSmoothIter', 'Laplacian Smooth Iterations', 0, 20, 3, 1, '')}
            ${sel('fsTexture', 'Texture Mapping', [{v:'uv',t:'UV Projection (high quality)',s:true},'Vertex Color','None'])}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Landmark & Tracking</div>
            ${sel('fsLandmarks', 'Landmark Model', ['5-point (basic)',{v:'68pt',t:'68-point (DLIB-style)',s:true},'468-point (MediaPipe-dense)'])}
            ${range('fsExpBlend', 'Expression Blendshape Count', 10, 52, 52, 1, '')}
            ${toggle('fsTracking', 'Temporal Tracking', 'Smooth landmarks across consecutive frames', true)}
            ${toggle('fsJawTrack', 'Jaw Articulation', 'Independent jaw rotation and translation', true)}
            ${toggle('fsGaze', 'Gaze Direction Estimation', 'Eye direction vector from iris landmarks', false)}
          </div>
        </div>

        <div>
          <div class="tm-params">
            <div class="tm-params-title">Processing Pipeline</div>
            ${toggle('fsDenoising', 'Depth Denoising', 'Bilateral filter on raw depth map', true)}
            ${toggle('fsHoleFill', 'Hole Filling', 'Inpaint missing depth regions via edge-aware interpolation', true)}
            ${toggle('fsBgRemove', 'Background Removal', 'Segment face from background before reconstruction', true)}
            ${toggle('fsSymmetry', 'Symmetry Regularization', 'Enforce bilateral facial symmetry constraint', false)}
            ${toggle('fsTexSmooth', 'Texture Smoothing', 'Remove blemishes and smooth skin texture', false)}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Output Settings</div>
            ${sel('fsFormat', 'Export Format', [{v:'obj',t:'Wavefront OBJ',s:true},'PLY (with normals)','GLTF 2.0 (web-ready)','FBX (animation-ready)','STL (3D print)'])}
            ${sel('fsCoord', 'Coordinate System', [{v:'opengl',t:'OpenGL (Y-up, right-handed)',s:true},'DirectX (Y-up, left-handed)','Blender (Z-up)'])}
            ${toggle('fsNormals', 'Export Vertex Normals', 'Per-vertex normals for smooth shading', true)}
            ${toggle('fsUVExport', 'Export UV Coordinates', 'UV layout for texture baking', true)}
          </div>
        </div>
      </div>

      <div class="tm-section" style="margin-top:24px;">
        <div class="tm-heading">Pipeline Output Preview</div>
        <div class="tm-console"><span class="dim">$</span> <span class="hl">synapex</span> module run facescan --input camera_0 --config profile.yaml

<span class="hl2">\u25B6</span> Capturing depth frame... <span class="hl2">OK</span> (640x480 @ 30fps)
<span class="hl2">\u25B6</span> Detecting face region... <span class="hl2">1 face found</span> [<span class="hl">142,67 → 498,413</span>]
<span class="hl2">\u25B6</span> Extracting landmarks... <span class="hl2">68/68</span> detected (confidence: <span class="hl2">0.96</span>)
<span class="hl2">\u25B6</span> Depth denoising... bilateral filter sigma_s=<span class="hl">3</span> sigma_r=<span class="hl">0.05</span>
<span class="hl2">\u25B6</span> Reconstructing mesh... <span class="hg">15,247 vertices</span>, <span class="hg">30,102 faces</span>
<span class="hl2">\u25B6</span> Applying FLAME template... <span class="hl2">52 blendshapes</span> fitted
<span class="hl2">\u25B6</span> UV projection & texture bake... <span class="hl2">2048x2048</span> diffuse map
<span class="hl2">\u25B6</span> Laplacian smoothing... <span class="hl">3</span> iterations

<span class="hl2">\u2713</span> Output: <span class="hp">output/face_scan_001.obj</span> + <span class="hp">.mtl</span> + <span class="hp">texture.png</span>
<span class="hl2">\u2713</span> Processing time: <span class="hg">142ms</span></div>
      </div>

      <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
        <button class="tm-btn">Start Capture</button>
        <button class="tm-btn outline">Export Config</button>
        <button class="tm-btn outline">Calibrate Sensor</button>
      </div>
    `;
    wireRanges(el);
  }

  /* ═════════════════════════════════════════════════
     3. OBJECT DETECTION
     ═════════════════════════════════════════════════ */
  function initObjDet(el) {
    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">94.7%</div><div class="tm-stat-lbl">COCO mAP@50</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">85</div><div class="tm-stat-lbl">FPS (RTX 4090)</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">112M</div><div class="tm-stat-lbl">Parameters</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">80+</div><div class="tm-stat-lbl">Object Classes</div></div>
      </div>

      <div class="tm-split">
        <div>
          <div class="tm-params">
            <div class="tm-params-title">Model Architecture</div>
            ${sel('odArch', 'Architecture', ['YOLOv8-S (small)',{v:'yolov8m',t:'YOLOv8-M (medium)',s:true},'YOLOv8-L (large)','YOLOv8-X (xlarge)','DETR (transformer)','Faster R-CNN'])}
            ${sel('odBackbone', 'Backbone', ['CSPDarknet',{v:'effnet',t:'EfficientNet-B4',s:true},'ConvNeXt-T','Swin-T (transformer)','ResNet-101'])}
            ${sel('odNeck', 'Neck / FPN', [{v:'pafpn',t:'PANet + FPN',s:true},'BiFPN','NAS-FPN','Simple FPN'])}
            ${sel('odHead', 'Detection Head', [{v:'decoupled',t:'Decoupled Head',s:true},'Anchor-based','Anchor-free (FCOS)','DETR decoder'])}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Detection Parameters</div>
            ${range('odConf', 'Confidence Threshold', 0.05, 0.95, 0.5, 0.05, '')}
            ${range('odNms', 'NMS IoU Threshold', 0.1, 0.9, 0.45, 0.05, '')}
            ${range('odMaxDet', 'Max Detections per Image', 10, 1000, 300, 10, '')}
            ${sel('odInputSize', 'Input Resolution', ['320x320','416x416','512x512',{v:'640',t:'640x640 (default)',s:true},'832x832','1280x1280'])}
            ${sel('odAugment', 'Test-Time Augmentation', [{v:'none',t:'None',s:true},'Multi-scale (3x)','Multi-scale + Flip (6x)'])}
          </div>
        </div>

        <div>
          <div class="tm-params">
            <div class="tm-params-title">Task Configuration</div>
            ${toggle('odSegment', 'Instance Segmentation', 'Per-object mask prediction alongside bounding boxes', true)}
            ${toggle('odTrack', 'Multi-Object Tracking', 'ByteTrack / BoT-SORT cross-frame ID association', false)}
            ${toggle('odRotated', 'Oriented Bounding Boxes', 'Rotated rectangles for angled objects', false)}
            ${toggle('odClassAgnostic', 'Class-Agnostic Mode', 'Detect objects regardless of class label', false)}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Training Hyperparameters</div>
            ${num('odEpochs', 'Epochs', 120, 1, 1000, 1)}
            ${range('odLR', 'Learning Rate', 0.0001, 0.05, 0.01, 0.0001, '')}
            ${sel('odOptimizer', 'Optimizer', [{v:'sgd',t:'SGD + Momentum',s:true},'AdamW','LAMB','Lion'])}
            ${sel('odScheduler', 'LR Scheduler', ['Cosine Annealing',{v:'onecycle',t:'OneCycleLR',s:true},'Step Decay','Linear Warmup + Cosine'])}
            ${range('odWarmup', 'Warmup Epochs', 0, 20, 3, 1, '')}
            ${sel('odAugTrain', 'Data Augmentation', ['Basic (flip + scale)',{v:'mosaic',t:'Mosaic + MixUp',s:true},'CopyPaste','AutoAugment'])}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Export & Deployment</div>
            ${sel('odExport', 'Export Format', [{v:'pt',t:'PyTorch (.pt)',s:true},'ONNX','TensorRT (FP16)','TFLite','CoreML','OpenVINO'])}
            ${sel('odQuantize', 'Quantization', ['None (FP32)',{v:'fp16',t:'FP16 (recommended)',s:true},'INT8 (calibrated)','INT8 (PTQ)'])}
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
        <button class="tm-btn">Start Training</button>
        <button class="tm-btn outline">Validate Model</button>
        <button class="tm-btn outline">Export Weights</button>
        <button class="tm-btn outline">Deploy API</button>
      </div>
    `;
    wireRanges(el);
  }

  /* ═════════════════════════════════════════════════
     4. POSE ESTIMATION
     ═════════════════════════════════════════════════ */
  function initPose(el) {
    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">76.3</div><div class="tm-stat-lbl">COCO AP</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">60</div><div class="tm-stat-lbl">FPS Realtime</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">17+21</div><div class="tm-stat-lbl">Body + Hand KP</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">89 MB</div><div class="tm-stat-lbl">Model Size</div></div>
      </div>

      <div class="tm-split">
        <div>
          <div class="tm-params">
            <div class="tm-params-title">Skeleton Configuration</div>
            ${sel('peMode', 'Estimation Mode', [{v:'topdown',t:'Top-Down (person detector + pose)',s:true},'Bottom-Up (associative embedding)','Lite (single person only)'])}
            ${sel('peKeypoints', 'Keypoint Set', [{v:'coco17',t:'COCO-17 (body)',s:true},'COCO-17 + Feet (23)','WholeBody-133 (body+face+hands)','Hand-21 (single hand)','MPII-16'])}
            ${sel('peHeatmap', 'Heatmap Resolution', ['48x36','64x48',{v:'96x72',t:'96x72 (default)',s:true},'128x96','192x144 (high-res)'])}
            ${range('peKpThresh', 'Keypoint Confidence Threshold', 0.1, 0.9, 0.3, 0.05, '')}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Tracking & Temporal</div>
            ${toggle('peTrack', 'Multi-Person Tracking', 'OKS-based tracking across frames', true)}
            ${toggle('peSmooth', 'Temporal Smoothing', 'One-Euro filter for jitter reduction', true)}
            ${range('peSmoothFreq', 'Smoothing Min Cutoff', 0.1, 10, 1.7, 0.1, 'Hz')}
            ${toggle('peInterp', 'Occluded Keypoint Interpolation', 'Predict invisible keypoints from visible context', true)}
            ${toggle('peVelocity', 'Joint Velocity Estimation', 'First-order derivative of keypoint positions', false)}
          </div>
        </div>

        <div>
          <div class="tm-params">
            <div class="tm-params-title">Action & Gesture Recognition</div>
            ${toggle('peAction', 'Action Classification', 'Temporal CNN on skeleton sequences', false)}
            ${sel('peActionModel', 'Action Model', ['ST-GCN',{v:'ctrgcn',t:'CTR-GCN (recommended)',s:true},'PoseC3D','MotionBERT'])}
            ${num('peActionWindow', 'Temporal Window (frames)', 30, 8, 300, 1)}
            ${toggle('peGesture', 'Hand Gesture Recognition', 'Classify hand poses into gesture vocabulary', false)}
            ${num('peGestureClasses', 'Gesture Classes', 12, 4, 100, 1)}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">3D Pose Lifting</div>
            ${toggle('pe3D', '3D Pose Estimation', 'Lift 2D keypoints to 3D world coordinates', false)}
            ${sel('pe3DModel', 'Lifting Model', [{v:'videopose',t:'VideoPose3D',s:true},'MotionBERT','MHFormer','SimpleBaseline3D'])}
            ${sel('pe3DRoot', 'Root Joint', [{v:'pelvis',t:'Pelvis (hip center)',s:true},'Thorax','Neck'])}
            ${toggle('pe3DCam', 'Camera-Relative Coordinates', 'Output in camera coordinate system', true)}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Output Format</div>
            ${sel('peFormat', 'Data Format', [{v:'json',t:'JSON (keypoints array)',s:true},'COCO Keypoint JSON','BVH (animation)','CSV (flat table)','Protobuf'])}
            ${toggle('peVis', 'Render Skeleton Overlay', 'Draw keypoints and limbs on source image', true)}
            ${sel('peVisStyle', 'Visualization Style', [{v:'lines',t:'Lines + Circles',s:true},'Heatmap Overlay','Thick Limbs (presentation)','Minimal Dots'])}
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
        <button class="tm-btn">Run Estimation</button>
        <button class="tm-btn outline">Calibrate Camera</button>
        <button class="tm-btn outline">Export Pipeline</button>
      </div>
    `;
    wireRanges(el);
  }

  /* ═════════════════════════════════════════════════
     5. SPEECH RECOGNITION
     ═════════════════════════════════════════════════ */
  function initSpeech(el) {
    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">3.2%</div><div class="tm-stat-lbl">WER (English)</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">42</div><div class="tm-stat-lbl">Languages</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">&lt;200ms</div><div class="tm-stat-lbl">Latency (stream)</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">890 MB</div><div class="tm-stat-lbl">Model Size</div></div>
      </div>

      <div class="tm-split">
        <div>
          <div class="tm-params">
            <div class="tm-params-title">Audio Input</div>
            ${sel('srSource', 'Input Source', [{v:'mic',t:'Microphone (real-time)',s:true},'Audio File Upload','Streaming URL (RTSP/WebSocket)','Batch Directory'])}
            ${sel('srSampleRate', 'Sample Rate', ['8000 Hz (telephony)',{v:'16000',t:'16000 Hz (default)',s:true},'22050 Hz','44100 Hz','48000 Hz'])}
            ${sel('srChannels', 'Channels', [{v:'mono',t:'Mono',s:true},'Stereo','Multi-channel (array)'])}
            ${range('srChunkSize', 'Stream Chunk Duration (ms)', 100, 5000, 1000, 100, 'ms')}
            ${toggle('srVAD', 'Voice Activity Detection', 'Silero VAD for speech/non-speech segmentation', true)}
            ${range('srVADThresh', 'VAD Sensitivity', 0.1, 0.9, 0.5, 0.05, '')}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Language & Model</div>
            ${sel('srModel', 'ASR Model', ['Whisper-tiny (39M)','Whisper-base (74M)',{v:'whisper-medium',t:'Whisper-medium (769M)',s:true},'Whisper-large-v3 (1.5B)','Wav2Vec2-XLSR','Conformer-CTC'])}
            ${sel('srLang', 'Primary Language', [{v:'en',t:'English',s:true},'Spanish','French','German','Polish','Japanese','Chinese (Mandarin)','Arabic','Hindi','Auto-detect'])}
            ${toggle('srMultilang', 'Multilingual Mode', 'Handle code-switching between languages', false)}
            ${toggle('srTranslate', 'Translate to English', 'Translate non-English speech to English text', false)}
          </div>
        </div>

        <div>
          <div class="tm-params">
            <div class="tm-params-title">Post-Processing</div>
            ${toggle('srPunct', 'Punctuation Restoration', 'Insert commas, periods, question marks', true)}
            ${toggle('srCapital', 'True-Casing', 'Capitalize proper nouns and sentence starts', true)}
            ${toggle('srDiarize', 'Speaker Diarization', 'Identify and label different speakers', false)}
            ${num('srMaxSpeakers', 'Max Speakers (diarization)', 4, 2, 20, 1)}
            ${toggle('srTimestamps', 'Word-level Timestamps', 'Alignment of each word to audio timeline', true)}
            ${toggle('srConfidence', 'Word Confidence Scores', 'Per-word probability for quality filtering', false)}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Noise & Enhancement</div>
            ${toggle('srDenoise', 'Noise Suppression', 'Neural noise reduction (RNNoise / DeepFilterNet)', true)}
            ${sel('srDenoiseModel', 'Noise Model', [{v:'rnnoise',t:'RNNoise (fast)',s:true},'DeepFilterNet2 (quality)','PercepNet'])}
            ${toggle('srDereverb', 'Dereverberation', 'Reduce room echo for cleaner transcription', false)}
            ${toggle('srAGC', 'Automatic Gain Control', 'Normalize audio volume levels', true)}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Output</div>
            ${sel('srFormat', 'Transcript Format', [{v:'plain',t:'Plain Text',s:true},'SRT (subtitles)','VTT (web subtitles)','JSON (structured)','CTM (time-aligned)'])}
            ${sel('srEncoding', 'Text Encoding', [{v:'utf8',t:'UTF-8',s:true},'ASCII','ISO-8859-1'])}
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
        <button class="tm-btn">Start Transcription</button>
        <button class="tm-btn outline">Test Microphone</button>
        <button class="tm-btn outline">Export Config</button>
      </div>
    `;
    wireRanges(el);
  }

  /* ═════════════════════════════════════════════════
     6. SCENE UNDERSTANDING
     ═════════════════════════════════════════════════ */
  function initScene(el) {
    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">62.4</div><div class="tm-stat-lbl">PQ (panoptic)</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">150</div><div class="tm-stat-lbl">Semantic Classes</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">30</div><div class="tm-stat-lbl">FPS (A100)</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">567 MB</div><div class="tm-stat-lbl">Model Size</div></div>
      </div>

      <div class="tm-split">
        <div>
          <div class="tm-params">
            <div class="tm-params-title">Segmentation Mode</div>
            ${sel('scMode', 'Task Type', ['Semantic Segmentation',{v:'panoptic',t:'Panoptic Segmentation',s:true},'Instance Segmentation','Stuff-only Segmentation'])}
            ${sel('scArch', 'Architecture', ['Mask2Former',{v:'oneformer',t:'OneFormer (unified)',s:true},'SegFormer','DeepLabV3+','UPerNet'])}
            ${sel('scBackbone', 'Backbone', ['ResNet-101','ConvNeXt-L',{v:'swin-l',t:'Swin-L (transformer)',s:true},'DiNAT-L','InternImage-XL'])}
            ${sel('scDataset', 'Class Vocabulary', ['ADE20K (150 classes)',{v:'coco-pan',t:'COCO Panoptic (133)',s:true},'Cityscapes (19)','Mapillary Vistas (65)','Custom (upload ontology)'])}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Input & Resolution</div>
            ${sel('scInput', 'Input Source', [{v:'single',t:'Single Image',s:true},'Video Stream','Stereo Pair','RGB-D','Point Cloud (LiDAR)'])}
            ${sel('scRes', 'Processing Resolution', ['512x512','640x640',{v:'1024',t:'1024x1024',s:true},'1280x1280','Original (no resize)'])}
            ${toggle('scMultiscale', 'Multi-Scale Inference', 'Process at 0.5x, 1x, 2x and merge predictions', false)}
            ${toggle('scSliding', 'Sliding Window', 'For high-res images: tile-based processing', false)}
            ${num('scOverlap', 'Tile Overlap (px)', 64, 0, 256, 16)}
          </div>
        </div>

        <div>
          <div class="tm-params">
            <div class="tm-params-title">Spatial Analysis</div>
            ${toggle('scDepth', 'Monocular Depth Estimation', 'Predict per-pixel depth from single RGB', false)}
            ${sel('scDepthModel', 'Depth Model', [{v:'dpt',t:'DPT-Large (MiDaS)',s:true},'ZoeDepth','Metric3D','DepthAnything'])}
            ${toggle('scRelations', 'Spatial Relationship Extraction', 'Above/below/left/right/inside/on relations between objects', true)}
            ${toggle('scOccupancy', 'Occupancy Grid', 'Bird-eye-view traversability map for navigation', false)}
            ${range('scGridRes', 'Grid Resolution (cm/cell)', 1, 50, 10, 1, 'cm')}
            ${toggle('sc3DLayout', '3D Room Layout', 'Estimate floor, ceiling, wall planes', false)}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Navigation Context</div>
            ${toggle('scTraversable', 'Traversability Analysis', 'Classify regions as walkable/obstacle/hazard', true)}
            ${toggle('scSemMap', 'Semantic Map Accumulation', 'Build persistent map from sequential frames', false)}
            ${sel('scMapFormat', 'Map Output', [{v:'costmap',t:'2D Cost Map',s:true},'3D Voxel Grid','Mesh','Gaussian Splat'])}
            ${toggle('scDynamic', 'Dynamic Object Filtering', 'Separate moving objects from static scene', true)}
          </div>

          <div class="tm-params" style="margin-top:14px;">
            <div class="tm-params-title">Output</div>
            ${sel('scOutFormat', 'Mask Format', [{v:'png',t:'PNG (indexed color)',s:true},'COCO RLE','Numpy (.npy)','Binary masks (per-class)'])}
            ${toggle('scVis', 'Render Visualization', 'Color-coded overlay on source image', true)}
            ${sel('scPalette', 'Color Palette', [{v:'ade20k',t:'ADE20K standard',s:true},'Cityscapes','Random','Grayscale'])}
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
        <button class="tm-btn">Run Analysis</button>
        <button class="tm-btn outline">Upload Image</button>
        <button class="tm-btn outline">Export Pipeline</button>
        <button class="tm-btn outline">Build Semantic Map</button>
      </div>
    `;
    wireRanges(el);
  }

})();
