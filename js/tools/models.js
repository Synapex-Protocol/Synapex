/* SYNAPEX LAB — Models Tool */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initModels = function (el) {
  const models = [
    { icon: '\u{1F441}', name: 'vision-backbone-v1',   cat: 'Vision',  params: '86M',  size: '342 MB', license: 'MIT',    acc: '98.2', desc: 'Core vision backbone trained on 14M images. Suitable as base for fine-tuning object detection, classification, and segmentation tasks. Optimized for both cloud and edge inference.' },
    { icon: '\u{1F9BE}', name: 'motor-control-v2',     cat: 'Motor',   params: '32M',  size: '128 MB', license: 'Apache',  acc: '96.8', desc: 'Reinforcement learning policy for bipedal and quadrupedal locomotion. Trained in MuJoCo with domain randomization for sim-to-real transfer.' },
    { icon: '\u{1F9E0}', name: 'perception-fusion-v1', cat: 'Percept', params: '142M', size: '567 MB', license: 'MIT',    acc: '97.1', desc: 'Multi-modal perception model fusing camera, LIDAR, and depth sensor inputs. Produces unified scene embeddings for downstream planning and navigation.' },
    { icon: '\u{1F916}', name: 'face-rec-v2',          cat: 'Vision',  params: '54M',  size: '215 MB', license: 'MIT',    acc: '99.4', desc: 'State-of-the-art face recognition with multi-angle and low-light optimization. Real-time inference at 120fps on RTX 4090.' },
    { icon: '\u{1F3AF}', name: 'object-det-v3',        cat: 'Vision',  params: '112M', size: '445 MB', license: 'GPL',    acc: '94.7', desc: 'Multi-class detection with instance segmentation. Based on modified YOLO architecture with transformer attention layers for small object detection.' },
  ];

  el.innerHTML = `
    <div class="tm-grid">
      <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">24</div><div class="tm-stat-lbl">Published Models</div></div>
      <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">18.8K</div><div class="tm-stat-lbl">Total Downloads</div></div>
      <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">12</div><div class="tm-stat-lbl">Contributors</div></div>
      <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">97.2%</div><div class="tm-stat-lbl">Avg Accuracy</div></div>
    </div>

    <div class="tm-section">
      <div class="tm-heading">Search Models</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <input class="tm-input" placeholder="Search by name, category, or keyword..." style="flex:1;min-width:200px;" id="modelSearch">
        <select class="tm-input" style="width:auto;min-width:140px;" id="modelFilter">
          <option value="">All Categories</option>
          <option value="Vision">Vision</option>
          <option value="Motor">Motor</option>
          <option value="Percept">Perception</option>
        </select>
      </div>
    </div>

    <div class="tm-section" id="modelList">
      ${models.map((m, i) => renderModel(m, i)).join('')}
    </div>
  `;

  function renderModel(m, i) {
    return `
    <div class="tm-row" data-cat="${m.cat}" data-name="${m.name}">
      <div class="tm-row-top">
        <span class="tm-row-icon">${m.icon}</span>
        <span class="tm-row-name">synapex/${m.name}</span>
        <span class="tm-row-badge" style="background:rgba(0,212,168,0.1);color:var(--accent2);border:1px solid rgba(0,212,168,0.2);">${m.cat}</span>
      </div>
      <div class="tm-row-desc">${m.desc}</div>
      <div class="tm-row-footer">
        <div class="tm-row-meta">
          <span>${m.params} params</span>
          <span>${m.size}</span>
          <span>Accuracy: ${m.acc}%</span>
          <span class="tm-tag">${m.license}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="tm-btn sm">Load Model</button>
          <button class="tm-btn sm outline">Fine-tune</button>
          <button class="tm-btn sm outline">View Weights</button>
        </div>
      </div>
    </div>`;
  }

  const search = document.getElementById('modelSearch');
  const filter = document.getElementById('modelFilter');
  const filterFn = () => {
    const q = search.value.toLowerCase();
    const cat = filter.value;
    document.querySelectorAll('#modelList .tm-row').forEach(row => {
      const name = row.dataset.name.toLowerCase();
      const rowCat = row.dataset.cat;
      const matchQ = !q || name.includes(q) || row.textContent.toLowerCase().includes(q);
      const matchCat = !cat || rowCat === cat;
      row.style.display = (matchQ && matchCat) ? '' : 'none';
    });
  };
  search.addEventListener('input', filterFn);
  filter.addEventListener('change', filterFn);
};
