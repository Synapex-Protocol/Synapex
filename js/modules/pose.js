/* SYNAPEX LAB — Pose Estimation Module */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initPose = function (el) {
  var toggle = SynapexLab.toggle, range = SynapexLab.range, sel = SynapexLab.sel, num = SynapexLab.num, wireRanges = SynapexLab.wireRanges;
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
};
