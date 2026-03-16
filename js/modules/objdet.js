/* SYNAPEX LAB — Object Detection Module */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initObjDet = function (el) {
  var toggle = SynapexLab.toggle, range = SynapexLab.range, sel = SynapexLab.sel, num = SynapexLab.num, wireRanges = SynapexLab.wireRanges;
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
};
