/* SYNAPEX LAB — 3D Face Scanning Module */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initFaceScan = function (el) {
  var toggle = SynapexLab.toggle, range = SynapexLab.range, sel = SynapexLab.sel, num = SynapexLab.num, wireRanges = SynapexLab.wireRanges;
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
};
