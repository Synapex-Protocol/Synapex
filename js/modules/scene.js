/* SYNAPEX LAB — Scene Understanding Module */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initScene = function (el) {
  var toggle = SynapexLab.toggle, range = SynapexLab.range, sel = SynapexLab.sel, num = SynapexLab.num, wireRanges = SynapexLab.wireRanges;
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
};
