/* ═══════════════════════════════════════════════════
   SYNAPEX LAB — Infrastructure Programs (Modal)
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  const cards = document.querySelectorAll('.card-clickable[data-tool]');
  const backdrop = document.getElementById('toolModalBackdrop');
  const body = document.getElementById('toolModalBody');
  const iconEl = document.getElementById('toolModalIcon');
  const titleEl = document.getElementById('toolModalTitle');
  const subtitleEl = document.getElementById('toolModalSubtitle');
  const closeBtn = document.getElementById('toolModalClose');

  if (!cards.length || !backdrop) return;

  const TOOLS = {
    compute:    { icon: '\u{1F5A5}', title: 'Compute Marketplace',   sub: 'GPU Network Console',      init: initCompute },
    models:     { icon: '\u{1F52C}', title: 'Model Repository',      sub: 'Research Model Browser',    init: initModels },
    simulation: { icon: '\u{1F4CA}', title: 'Simulation Suite',      sub: 'Physics Environment Lab',   init: initSimulation },
    collab:     { icon: '\u{1F30E}', title: 'Collaboration Network', sub: 'Research Community Hub',     init: initCollab },
    dao:        { icon: '\u{1F5F3}', title: 'Research DAO',          sub: 'Governance Terminal',        init: initDAO },
    ip:         { icon: '\u{1F6E1}', title: 'IP Protection',         sub: 'On-Chain IP Registry',       init: initIP }
  };

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.tool));
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) closeModal();
  });

  function openModal(key) {
    const t = TOOLS[key];
    if (!t) return;
    iconEl.textContent = t.icon;
    titleEl.textContent = t.title;
    subtitleEl.textContent = t.sub;
    body.innerHTML = '';
    t.init(body);
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => backdrop.classList.add('visible'));
    });
  }

  function closeModal() {
    backdrop.classList.remove('visible');
    setTimeout(() => {
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
      body.innerHTML = '';
    }, 360);
  }

  /* ═════════════════════════════════════════════════
     1. COMPUTE MARKETPLACE
     ═════════════════════════════════════════════════ */
  function initCompute(el) {
    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">6</div><div class="tm-stat-lbl">Active Nodes</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">6,323</div><div class="tm-stat-lbl">Total TFLOPS</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">89%</div><div class="tm-stat-lbl">Utilization</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">$12.5</div><div class="tm-stat-lbl">Avg $SYNX/hr</div></div>
      </div>

      <div class="tm-section">
        <div class="tm-heading">Provision a Compute Job</div>
        <div class="tm-form-grid">
          <div class="tm-form-group">
            <span class="tm-label">Job Type</span>
            <select class="tm-input" id="cmJobType">
              <option value="training">Training Run</option>
              <option value="inference">Inference Endpoint</option>
              <option value="simulation">Simulation Environment</option>
              <option value="finetune">Fine-Tuning Session</option>
            </select>
          </div>
          <div class="tm-form-group">
            <span class="tm-label">GPU Tier</span>
            <select class="tm-input" id="cmGpuTier">
              <option value="rtx4090">RTX 4090 (24GB) — 12.5 $SYNX/hr</option>
              <option value="a100">A100 80GB — 38.0 $SYNX/hr</option>
              <option value="h100">H100 80GB — 72.0 $SYNX/hr</option>
            </select>
          </div>
          <div class="tm-form-group">
            <span class="tm-label">GPU Count</span>
            <select class="tm-input" id="cmGpuCount">
              <option>1</option><option>2</option><option selected>4</option><option>8</option>
            </select>
          </div>
          <div class="tm-form-group">
            <span class="tm-label">Est. Duration (hours)</span>
            <input type="number" class="tm-input" id="cmDuration" value="8" min="1" max="720">
          </div>
        </div>
        <div id="cmEstimate" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:16px;margin-top:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <span class="tm-label" style="margin-bottom:2px;">Estimated Cost</span>
            <div style="font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:var(--gold);" id="cmCost">400.0 $SYNX</div>
          </div>
          <button class="tm-btn" id="cmProvisionBtn">Provision Cluster</button>
        </div>
      </div>

      <div class="tm-section">
        <div class="tm-heading">Network Activity Log</div>
        <div class="tm-console" id="cmLog"><span class="dim">[system]</span> Compute marketplace initialized. 6 nodes online.
<span class="dim">[system]</span> Network utilization at <span class="hl2">89%</span> — peak hours active.
<span class="dim">[node-alpha]</span> Training job <span class="hl">face-rec-v3</span> epoch 47/120 — loss: <span class="hl2">0.018</span>
<span class="dim">[node-beta]</span>  Inference endpoint <span class="hp">vision-api-prod</span> serving 2,340 req/min
<span class="dim">[node-epsilon]</span> H100 cluster idle — <span class="hg">available for provisioning</span></div>
      </div>
    `;

    const prices = { rtx4090: 12.5, a100: 38.0, h100: 72.0 };
    const estimate = () => {
      const tier = document.getElementById('cmGpuTier').value;
      const count = parseInt(document.getElementById('cmGpuCount').value);
      const hours = parseFloat(document.getElementById('cmDuration').value) || 1;
      const total = (prices[tier] * count * hours).toFixed(1);
      document.getElementById('cmCost').textContent = total + ' $SYNX';
    };
    ['cmGpuTier','cmGpuCount','cmDuration'].forEach(id => {
      document.getElementById(id).addEventListener('input', estimate);
      document.getElementById(id).addEventListener('change', estimate);
    });

    document.getElementById('cmProvisionBtn').addEventListener('click', () => {
      const log = document.getElementById('cmLog');
      const type = document.getElementById('cmJobType').value;
      const tier = document.getElementById('cmGpuTier').value;
      const count = document.getElementById('cmGpuCount').value;
      log.innerHTML += `\n<span class="hl2">[provision]</span> Requesting ${count}x <span class="hl">${tier.toUpperCase()}</span> for <span class="hp">${type}</span>...`;
      setTimeout(() => {
        log.innerHTML += `\n<span class="hl2">\u2713</span> Cluster allocated. Job ID: <span class="hg">synx-${Math.random().toString(36).slice(2, 10)}</span>`;
        log.innerHTML += `\n<span class="dim">[system]</span> Billing active at <span class="hg">${document.getElementById('cmCost').textContent}</span> total estimate.`;
        log.scrollTop = log.scrollHeight;
      }, 800);
    });
  }

  /* ═════════════════════════════════════════════════
     2. MODEL REPOSITORY
     ═════════════════════════════════════════════════ */
  function initModels(el) {
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
  }

  /* ═════════════════════════════════════════════════
     3. SIMULATION SUITE
     ═════════════════════════════════════════════════ */
  function initSimulation(el) {
    const envs = [
      { icon: '\u{1F3C3}', name: 'Locomotion Arena',  engine: 'MuJoCo',    agents: 16, status: 'live',    desc: 'Bipedal and quadrupedal locomotion over procedurally generated terrain. Stair climbing, slope traversal, uneven surfaces, and obstacle avoidance. Supports domain randomization for sim-to-real transfer with configurable friction, mass, and joint parameters.' },
      { icon: '\u{1F91D}', name: 'Manipulation Lab',  engine: 'Isaac Sim',  agents: 8,  status: 'live',    desc: 'Robotic manipulation workspace with 6-DOF and 7-DOF arms. Tasks include precision grasping, stacking, sorting, and deformable object handling. Tactile sensor simulation and multi-finger dexterous manipulation.' },
      { icon: '\u{1F3D9}', name: 'Navigation City',   engine: 'Unity ML',   agents: 32, status: 'live',    desc: 'Full-scale urban environment with dynamic pedestrians, vehicle traffic, and multi-floor buildings. Indoor-outdoor transitions, elevator navigation, and social navigation constraints.' },
      { icon: '\u{1F30A}', name: 'Aquatic Lab',       engine: 'MuJoCo',     agents: 12, status: 'beta',    desc: 'Underwater robotics simulation with realistic buoyancy, drag, and current dynamics. Marine object interaction, seabed exploration, and multi-agent swarm coordination in 3D fluid environments.' },
      { icon: '\u{1F680}', name: 'Zero-G Assembly',   engine: 'Isaac Sim',  agents: 4,  status: 'planned', desc: 'Microgravity environment for orbital construction and maintenance tasks. Tether physics, reaction wheel control, multi-robot cooperative assembly of modular structures.' },
      { icon: '\u{1F3ED}', name: 'Factory Floor',     engine: 'Unity ML',   agents: 24, status: 'beta',    desc: 'Industrial automation scenarios with conveyor systems, robotic welding stations, quality inspection, and warehouse logistics. Multi-robot cooperative workflows with real-time scheduling.' },
    ];

    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">6</div><div class="tm-stat-lbl">Environments</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">3</div><div class="tm-stat-lbl">Physics Engines</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">96</div><div class="tm-stat-lbl">Max Concurrent Agents</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">24/7</div><div class="tm-stat-lbl">Uptime</div></div>
      </div>

      ${envs.map(e => {
        const badgeStyle = e.status === 'live'
          ? 'background:rgba(0,212,168,0.1);color:var(--accent2);border:1px solid rgba(0,212,168,0.2);'
          : e.status === 'beta'
          ? 'background:rgba(232,200,122,0.1);color:var(--gold);border:1px solid rgba(232,200,122,0.2);'
          : 'background:rgba(74,140,255,0.08);color:var(--muted);border:1px solid var(--border);';
        return `
        <div class="tm-row">
          <div class="tm-row-top">
            <span class="tm-row-icon">${e.icon}</span>
            <span class="tm-row-name">${e.name}</span>
            <span class="tm-row-badge" style="${badgeStyle}">${e.status}</span>
          </div>
          <div class="tm-row-desc">${e.desc}</div>
          <div class="tm-row-footer">
            <div class="tm-row-meta">
              <span>Engine: ${e.engine}</span>
              <span>Max Agents: ${e.agents}</span>
            </div>
            ${e.status === 'live'
              ? '<button class="tm-btn sm">Launch Environment</button>'
              : e.status === 'beta'
              ? '<button class="tm-btn sm outline">Request Beta Access</button>'
              : '<span style="font-family:\'DM Mono\',monospace;font-size:10px;color:var(--muted);letter-spacing:1px;">COMING SOON</span>'}
          </div>
        </div>`;
      }).join('')}
    `;
  }

  /* ═════════════════════════════════════════════════
     4. COLLABORATION NETWORK
     ═════════════════════════════════════════════════ */
  function initCollab(el) {
    const teams = [
      { icon: '\u{1F441}', name: 'Vision Research Group',  lead: 'Dr. Alexei Voronov', members: 14, papers: 7, datasets: 8,  focus: 'Computer Vision, Object Detection, Scene Understanding', activity: 92 },
      { icon: '\u{1F9BE}', name: 'Embodied AI Lab',        lead: 'Maria Chen',          members: 9,  papers: 4, datasets: 5,  focus: 'Locomotion, Manipulation, Motor Control', activity: 87 },
      { icon: '\u{1F9E0}', name: 'Cognitive Architecture', lead: 'Prof. Nkemdirim Obi', members: 7,  papers: 3, datasets: 3,  focus: 'Modular Mind, Planning, Reasoning', activity: 74 },
      { icon: '\u{1F50A}', name: 'Speech & Language',      lead: 'Yuki Tanaka',         members: 11, papers: 5, datasets: 6,  focus: 'ASR, NLP, Multi-language Processing', activity: 68 },
      { icon: '\u{1F4A1}', name: 'Sim-to-Real Transfer',   lead: 'Jonas Ekberg',        members: 6,  papers: 2, datasets: 4,  focus: 'Domain Adaptation, Physics Simulation, Deployment', activity: 81 },
    ];

    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">47</div><div class="tm-stat-lbl">Researchers</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">5</div><div class="tm-stat-lbl">Active Teams</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">21</div><div class="tm-stat-lbl">Published Papers</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">26</div><div class="tm-stat-lbl">Shared Datasets</div></div>
      </div>

      <div class="tm-section">
        <div class="tm-heading">Join a Research Team</div>
        <p style="font-size:14px;color:var(--body);line-height:1.7;margin-bottom:20px;">
          SYNAPEX research teams are open groups of scientists, engineers, and inventors collaborating
          on specific domains. Each team shares compute resources, datasets, and experiment results.
          Team leads curate research direction, but all members contribute and earn $SYNX based on impact.
        </p>
      </div>

      ${teams.map(t => {
        const barColor = t.activity > 80 ? 'var(--accent2)' : t.activity > 60 ? 'var(--accent)' : 'var(--gold)';
        return `
        <div class="tm-row">
          <div class="tm-row-top">
            <span class="tm-row-icon">${t.icon}</span>
            <span class="tm-row-name">${t.name}</span>
          </div>
          <div class="tm-row-desc">${t.focus}</div>
          <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin:6px 0 4px;">Lead: <span style="color:var(--text)">${t.lead}</span></div>
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;">Activity</span>
              <span style="font-family:'DM Mono',monospace;font-size:10px;color:${barColor};">${t.activity}%</span>
            </div>
            <div class="tm-bar"><div class="tm-bar-fill" style="width:${t.activity}%;background:${barColor};"></div></div>
          </div>
          <div class="tm-row-footer">
            <div class="tm-row-meta">
              <span>${t.members} members</span>
              <span>${t.papers} papers</span>
              <span>${t.datasets} datasets</span>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="tm-btn sm">Apply to Join</button>
              <button class="tm-btn sm outline">View Research</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    `;
  }

  /* ═════════════════════════════════════════════════
     5. RESEARCH DAO
     ═════════════════════════════════════════════════ */
  function initDAO(el) {
    const proposals = [
      { id: 'SYP-042', title: 'Allocate 500K $SYNX to H100 cluster expansion',       status: 'active',   f: 72, a: 18, ends: '3d 14h', author: '0x7a3f...c4e2', desc: 'Proposal to expand protocol-owned compute by adding 8x H100 GPUs to the epsilon cluster. Funds sourced from treasury reserve. Expected to reduce average job wait time by 40% and enable larger training runs.' },
      { id: 'SYP-041', title: 'Fund multi-language ASR research grant',                status: 'active',   f: 58, a: 12, ends: '5d 02h', author: '0x9d1b...a7f3', desc: 'Grant of 120K $SYNX to the Speech & Language team for developing ASR models covering 15 additional languages. Deliverables include open-source weights and a benchmark dataset.' },
      { id: 'SYP-040', title: 'Open-source vision-backbone-v1 model weights',          status: 'passed',   f: 91, a: 4,  ends: 'Ended',  author: '0x2e8c...d5b1', desc: 'Release the full weights of vision-backbone-v1 under MIT license. Currently restricted to $SYNX holders only. Expected to increase protocol visibility and attract new contributors.' },
      { id: 'SYP-039', title: 'Increase community module reward pool by 25%',          status: 'passed',   f: 84, a: 8,  ends: 'Ended',  author: '0xb3d7...f2a8', desc: 'Raise the per-inference reward rate for community-published modules from 0.002 to 0.0025 $SYNX. Retroactive for all existing modules. Funded by reducing team allocation by 2%.' },
      { id: 'SYP-038', title: 'Partner with Akash Network for burst compute capacity', status: 'rejected', f: 32, a: 55, ends: 'Ended',  author: '0x6f4a...e9c7', desc: 'Establish a formal partnership with Akash Network for overflow compute. Rejected due to concerns about dependency on external infrastructure and unfavorable pricing terms.' },
    ];

    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">42</div><div class="tm-stat-lbl">Total Proposals</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">2</div><div class="tm-stat-lbl">Active Votes</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">2.4M</div><div class="tm-stat-lbl">Treasury ($SYNX)</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">156</div><div class="tm-stat-lbl">Voting Members</div></div>
      </div>

      <div class="tm-section">
        <div class="tm-heading">Governance Proposals</div>
        <p style="font-size:14px;color:var(--body);line-height:1.7;margin-bottom:20px;">
          All protocol-level decisions go through on-chain governance. $SYNX holders can submit
          proposals, vote, and delegate voting power. A 60% quorum with simple majority is required
          for standard proposals. Treasury allocations above 100K $SYNX require 75% supermajority.
        </p>
      </div>

      ${proposals.map(p => {
        const total = p.f + p.a;
        const pctFor = Math.round(p.f / total * 100);
        const sc = p.status === 'active' ? '--accent' : p.status === 'passed' ? '--accent2' : '--accent3';
        return `
        <div class="tm-row">
          <div class="tm-row-top">
            <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--accent);font-weight:500;">${p.id}</span>
            <span class="tm-row-name" style="flex:1">${p.title}</span>
            <span class="tm-row-badge" style="background:var(${sc})12;color:var(${sc});border:1px solid var(${sc})30;">${p.status}</span>
          </div>
          <div class="tm-row-desc">${p.desc}</div>
          <div style="margin:10px 0;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--accent2);">For: ${p.f}%</span>
              <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--accent3);">Against: ${p.a}%</span>
            </div>
            <div style="display:flex;height:7px;border-radius:4px;overflow:hidden;background:var(--surface2);">
              <div style="width:${pctFor}%;background:var(--accent2);"></div>
              <div style="width:${100 - pctFor}%;background:var(--accent3);"></div>
            </div>
          </div>
          <div class="tm-row-footer">
            <div class="tm-row-meta">
              <span>Author: ${p.author}</span>
              <span>${p.ends === 'Ended' ? 'Vote ended' : 'Ends in ' + p.ends}</span>
            </div>
            ${p.status === 'active' ? `
              <div style="display:flex;gap:6px;">
                <button class="tm-btn sm">Vote For</button>
                <button class="tm-btn sm outline">Vote Against</button>
              </div>` : ''}
          </div>
        </div>`;
      }).join('')}

      <div class="tm-section" style="margin-top:28px;">
        <div class="tm-heading">Submit New Proposal</div>
        <div class="tm-form-grid">
          <div class="tm-form-group">
            <span class="tm-label">Proposal Title</span>
            <input class="tm-input" placeholder="Short, descriptive title...">
          </div>
          <div class="tm-form-group">
            <span class="tm-label">Category</span>
            <select class="tm-input">
              <option>Treasury Allocation</option>
              <option>Protocol Upgrade</option>
              <option>Research Grant</option>
              <option>Partnership</option>
              <option>Community</option>
            </select>
          </div>
        </div>
        <div class="tm-form-group">
          <span class="tm-label">Description</span>
          <textarea class="tm-input" placeholder="Detailed proposal description, rationale, and expected impact..."></textarea>
        </div>
        <div class="tm-form-group">
          <span class="tm-label">Requested Amount ($SYNX)</span>
          <input class="tm-input" type="number" placeholder="0">
        </div>
        <button class="tm-btn" style="margin-top:8px;">Submit for Voting</button>
      </div>
    `;
  }

  /* ═════════════════════════════════════════════════
     6. IP PROTECTION
     ═════════════════════════════════════════════════ */
  function initIP(el) {
    el.innerHTML = `
      <div class="tm-grid">
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">48</div><div class="tm-stat-lbl">Registered IPs</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">45</div><div class="tm-stat-lbl">Verified On-Chain</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">12</div><div class="tm-stat-lbl">Active Licenses</div></div>
        <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">3.2K</div><div class="tm-stat-lbl">$SYNX Earned</div></div>
      </div>

      <div class="tm-section">
        <div class="tm-heading">How IP Protection Works</div>
        <div class="tm-split">
          <div>
            <p style="font-size:14px;color:var(--body);line-height:1.7;margin-bottom:16px;">
              Every research output published through SYNAPEX is automatically registered on-chain
              with a cryptographic hash of the artifact. This creates an immutable, timestamped proof
              of authorship that cannot be disputed or retroactively altered.
            </p>
            <p style="font-size:14px;color:var(--body);line-height:1.7;">
              Smart contract licensing allows other researchers and developers to use your work
              under predefined terms. Revenue from each inference call or download is automatically
              split between the creator and the protocol treasury.
            </p>
          </div>
          <div class="tm-console"><span class="dim">$</span> <span class="hl">synapex</span> ip register --artifact model.pt

<span class="hl2">\u2713</span> Artifact hashed: <span class="hp">sha256:e3b0c44298fc...</span>
<span class="hl2">\u2713</span> On-chain TX: <span class="hg">0x7a3f...c4e2</span>
<span class="hl2">\u2713</span> Timestamp: <span class="hl">2026-03-10T14:23:07Z</span>
<span class="hl2">\u2713</span> Owner: <span class="hp">synx-researcher-alpha</span>
<span class="hl2">\u2713</span> License: <span class="hg">MIT</span>

<span class="dim">$</span> <span class="hl">synapex</span> ip verify --tx 0x7a3f...c4e2

<span class="hl2">\u2713</span> Verification: <span class="hl2">AUTHENTIC</span>
  Block: <span class="hl">18,427,301</span>
  Confirmations: <span class="hg">2,847</span></div>
        </div>
      </div>

      <div class="tm-section">
        <div class="tm-heading">Recent Registrations</div>
        ${[
          { hash: '0x7a3f...c4e2', title: 'Face Recognition v2 Model Weights',       owner: 'synx-researcher-alpha', license: 'MIT',        date: '2026-03-10' },
          { hash: '0x9d1b...a7f3', title: 'Motor Control RL Policy + Checkpoints',   owner: 'synx-lab-embodied',     license: 'Apache 2.0', date: '2026-03-08' },
          { hash: '0x2e8c...d5b1', title: 'Perception Fusion Architecture Spec',     owner: 'synx-researcher-beta',  license: 'GPL v3',     date: '2026-03-05' },
          { hash: '0x6f4a...e9c7', title: 'Urban Navigation Dataset (12K scenes)',    owner: 'synx-data-collective',  license: 'CC BY 4.0',  date: '2026-03-01' },
        ].map(r => `
          <div class="tm-row">
            <div class="tm-row-top">
              <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--accent);">${r.hash}</span>
              <span class="tm-row-name" style="flex:1">${r.title}</span>
              <span class="tm-row-badge" style="background:rgba(0,212,168,0.1);color:var(--accent2);border:1px solid rgba(0,212,168,0.2);">\u2713 verified</span>
            </div>
            <div class="tm-row-footer" style="margin-top:8px;">
              <div class="tm-row-meta">
                <span>Owner: ${r.owner}</span>
                <span class="tm-tag">${r.license}</span>
                <span>${r.date}</span>
              </div>
              <button class="tm-btn sm outline">View on Chain</button>
            </div>
          </div>`).join('')}
      </div>

      <div class="tm-section">
        <div class="tm-heading">Register New Research Output</div>
        <div class="tm-form-grid">
          <div class="tm-form-group">
            <span class="tm-label">Output Name</span>
            <input class="tm-input" placeholder="e.g. object-det-v3-weights">
          </div>
          <div class="tm-form-group">
            <span class="tm-label">License Type</span>
            <select class="tm-input">
              <option>MIT</option><option>Apache 2.0</option><option>GPL v3</option><option>CC BY 4.0</option><option>Proprietary</option>
            </select>
          </div>
        </div>
        <div class="tm-form-group">
          <span class="tm-label">Description</span>
          <textarea class="tm-input" placeholder="Describe the research artifact being registered..."></textarea>
        </div>
        <div class="tm-form-grid">
          <div class="tm-form-group">
            <span class="tm-label">Revenue Split (Creator %)</span>
            <input class="tm-input" type="number" value="85" min="50" max="100">
          </div>
          <div class="tm-form-group">
            <span class="tm-label">Artifact Hash (auto-generated)</span>
            <input class="tm-input" value="sha256:awaiting upload..." disabled style="opacity:0.5;">
          </div>
        </div>
        <button class="tm-btn" style="margin-top:8px;">Register on Chain</button>
      </div>
    `;
  }

})();
