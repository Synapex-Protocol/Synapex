/* ═══════════════════════════════════════════════════
   SYNAPEX LAB — Infrastructure Program Interfaces
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  const cards = document.querySelectorAll('.card-clickable[data-tool]');
  const workspace = document.getElementById('toolWorkspace');
  const toolBody = document.getElementById('toolBody');
  const toolIcon = document.getElementById('toolIcon');
  const toolTitle = document.getElementById('toolTitle');
  const closeBtn = document.getElementById('toolCloseBtn');

  if (!cards.length || !workspace) return;

  let activeTool = null;

  const TOOLS = {
    compute:    { icon: '\u{1F5A5}', title: 'Compute Marketplace',    init: initCompute },
    models:     { icon: '\u{1F52C}', title: 'Model Repository',       init: initModels },
    simulation: { icon: '\u{1F4CA}', title: 'Simulation Suite',       init: initSimulation },
    collab:     { icon: '\u{1F30E}', title: 'Collaboration Network',  init: initCollab },
    dao:        { icon: '\u{1F5F3}', title: 'Research DAO',           init: initDAO },
    ip:         { icon: '\u{1F6E1}', title: 'IP Protection',          init: initIP }
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.tool;
      if (activeTool === key) { closeTool(); return; }
      openTool(key);
    });
  });

  closeBtn.addEventListener('click', closeTool);

  function openTool(key) {
    const t = TOOLS[key];
    if (!t) return;
    activeTool = key;
    cards.forEach(c => c.classList.toggle('active', c.dataset.tool === key));
    toolIcon.textContent = t.icon;
    toolTitle.textContent = t.title;
    toolBody.innerHTML = '';
    t.init(toolBody);
    workspace.classList.add('visible');
    workspace.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closeTool() {
    activeTool = null;
    cards.forEach(c => c.classList.remove('active'));
    workspace.classList.remove('visible');
  }

  /* ─────────────────────────────────────────────
     1. COMPUTE MARKETPLACE
     ───────────────────────────────────────────── */
  function initCompute(el) {
    const nodes = [
      { name: 'synx-gpu-alpha',  gpu: '4x RTX 4090',  vram: '96 GB',  tflops: '330',  price: '12.5', status: 'online' },
      { name: 'synx-gpu-beta',   gpu: '8x A100 80GB',  vram: '640 GB', tflops: '1248', price: '38.0', status: 'online' },
      { name: 'synx-gpu-gamma',  gpu: '2x RTX 4090',  vram: '48 GB',  tflops: '165',  price: '6.8',  status: 'online' },
      { name: 'synx-gpu-delta',  gpu: '4x A6000',     vram: '192 GB', tflops: '310',  price: '15.2', status: 'busy' },
      { name: 'synx-gpu-epsilon',gpu: '8x H100 80GB',  vram: '640 GB', tflops: '3958', price: '72.0', status: 'online' },
      { name: 'synx-gpu-zeta',   gpu: '2x A100 40GB',  vram: '80 GB',  tflops: '312',  price: '14.0', status: 'offline' },
    ];

    el.innerHTML = `
      <div class="tool-stat-grid">
        <div class="tool-stat-box"><div class="tool-stat-val">6</div><div class="tool-stat-lbl">Active Nodes</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--accent2)">6,323</div><div class="tool-stat-lbl">Total TFLOPS</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--gold)">1,696</div><div class="tool-stat-lbl">Total VRAM (GB)</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--purple)">89%</div><div class="tool-stat-lbl">Utilization</div></div>
      </div>
      <span class="tool-label">Available GPU Nodes</span>
      <div class="tool-overflow-x">
      <table class="tool-table">
        <thead><tr>
          <th>Node</th><th>GPU</th><th>VRAM</th><th>TFLOPS</th><th>$SYNX/hr</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          ${nodes.map(n => `<tr>
            <td class="accent-val">${n.name}</td>
            <td>${n.gpu}</td>
            <td>${n.vram}</td>
            <td>${n.tflops}</td>
            <td class="gold-val">${n.price}</td>
            <td class="${n.status === 'online' ? 'status-on' : 'status-off'}">${n.status.toUpperCase()}</td>
            <td>${n.status === 'online' ? '<button class="tool-btn">Rent</button>' : n.status === 'busy' ? '<button class="tool-btn outline">Queue</button>' : ''}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      </div>
      <div class="tool-section-title">Network Load</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div>
          <span class="tool-label">Training</span>
          <div class="tool-progress-bar"><div class="tool-progress-fill" style="width:78%;background:var(--accent);"></div></div>
          <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-top:4px;">78% capacity</div>
        </div>
        <div>
          <span class="tool-label">Inference</span>
          <div class="tool-progress-bar"><div class="tool-progress-fill" style="width:92%;background:var(--accent2);"></div></div>
          <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-top:4px;">92% capacity</div>
        </div>
        <div>
          <span class="tool-label">Simulation</span>
          <div class="tool-progress-bar"><div class="tool-progress-fill" style="width:45%;background:var(--purple);"></div></div>
          <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-top:4px;">45% capacity</div>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────
     2. MODEL REPOSITORY
     ───────────────────────────────────────────── */
  function initModels(el) {
    const models = [
      { icon: '\u{1F441}', name: 'synapex/vision-backbone-v1',   type: 'Vision',     size: '342 MB', acc: '98.2%', downloads: '2,847', tags: ['CNN','ImageNet','Transfer Learning'] },
      { icon: '\u{1F9BE}', name: 'synapex/motor-control-v2',     type: 'Motor',      size: '128 MB', acc: '96.8%', downloads: '1,432', tags: ['RL','Locomotion','Sim2Real'] },
      { icon: '\u{1F9E0}', name: 'synapex/perception-fusion-v1', type: 'Perception', size: '567 MB', acc: '97.1%', downloads: '3,215', tags: ['Multi-Modal','LIDAR','Camera Fusion'] },
      { icon: '\u{1F916}', name: 'synapex/face-rec-v2',          type: 'Vision',     size: '215 MB', acc: '99.4%', downloads: '5,102', tags: ['Face Detection','Biometric','Real-time'] },
      { icon: '\u{1F3AF}', name: 'synapex/object-det-v3',        type: 'Vision',     size: '445 MB', acc: '94.7%', downloads: '4,338', tags: ['YOLO','Segmentation','Edge AI'] },
      { icon: '\u{1F50A}', name: 'synapex/speech-asr-v1',        type: 'NLP',        size: '890 MB', acc: '95.3%', downloads: '1,876', tags: ['ASR','Multi-lang','Streaming'] },
    ];

    el.innerHTML = `
      <div class="tool-stat-grid">
        <div class="tool-stat-box"><div class="tool-stat-val">24</div><div class="tool-stat-lbl">Models</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--accent2)">18.8K</div><div class="tool-stat-lbl">Downloads</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--gold)">12</div><div class="tool-stat-lbl">Contributors</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--purple)">6</div><div class="tool-stat-lbl">Categories</div></div>
      </div>
      <span class="tool-label">Featured Models</span>
      ${models.map(m => `
        <div class="tool-item-row">
          <div class="tool-item-icon">${m.icon}</div>
          <div class="tool-item-body">
            <div class="tool-item-name">${m.name}</div>
            <div class="tool-item-meta">
              <span>${m.type}</span>
              <span>${m.size}</span>
              <span>Acc: ${m.acc}</span>
              <span>${m.downloads} downloads</span>
            </div>
            <div style="margin-top:6px;">${m.tags.map(t => `<span class="tool-tag">${t}</span>`).join('')}</div>
          </div>
          <div class="tool-item-actions">
            <button class="tool-btn">Load</button>
            <button class="tool-btn outline">Fine-tune</button>
          </div>
        </div>
      `).join('')}
    `;
  }

  /* ─────────────────────────────────────────────
     3. SIMULATION SUITE
     ───────────────────────────────────────────── */
  function initSimulation(el) {
    const envs = [
      { icon: '\u{1F3C3}', name: 'Locomotion Arena',       engine: 'MuJoCo',       agents: 16,  complexity: 'High',   status: 'live',    desc: 'Bipedal & quadrupedal locomotion over varied terrain. Stair climbing, slope traversal, obstacle avoidance.' },
      { icon: '\u{1F91D}', name: 'Manipulation Lab',       engine: 'Isaac Sim',    agents: 8,   complexity: 'High',   status: 'live',    desc: 'Robotic arm manipulation: grasping, stacking, sorting. Deformable objects and multi-finger dexterity.' },
      { icon: '\u{1F3D9}', name: 'Navigation City',        engine: 'Unity ML',     agents: 32,  complexity: 'Medium', status: 'live',    desc: 'Urban environment navigation. Dynamic pedestrians, traffic, multi-floor indoor/outdoor transitions.' },
      { icon: '\u{1F30A}', name: 'Aquatic Lab',            engine: 'MuJoCo',       agents: 12,  complexity: 'Medium', status: 'beta',    desc: 'Underwater robotics simulation. Buoyancy, current dynamics, marine object interaction and exploration.' },
      { icon: '\u{1F680}', name: 'Zero-G Assembly',        engine: 'Isaac Sim',    agents: 4,   complexity: 'Extreme',status: 'planned', desc: 'Microgravity environment for orbital assembly tasks. Multi-agent cooperation, tether physics.' },
      { icon: '\u{1F3ED}', name: 'Factory Floor',          engine: 'Unity ML',     agents: 24,  complexity: 'High',   status: 'beta',    desc: 'Industrial automation scenarios. Conveyor systems, quality inspection, cooperative multi-robot workflows.' },
    ];

    const statusClass = s => s === 'live' ? 'status-on' : 'status-off';

    el.innerHTML = `
      <div class="tool-stat-grid">
        <div class="tool-stat-box"><div class="tool-stat-val">6</div><div class="tool-stat-lbl">Environments</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--accent2)">3</div><div class="tool-stat-lbl">Physics Engines</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--gold)">96</div><div class="tool-stat-lbl">Max Agents</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--purple)">24/7</div><div class="tool-stat-lbl">Uptime</div></div>
      </div>
      <span class="tool-label">Simulation Environments</span>
      ${envs.map(e => `
        <div class="tool-item-row">
          <div class="tool-item-icon">${e.icon}</div>
          <div class="tool-item-body">
            <div class="tool-item-name">${e.name}</div>
            <div class="tool-item-desc">${e.desc}</div>
            <div class="tool-item-meta">
              <span>Engine: ${e.engine}</span>
              <span>Max Agents: ${e.agents}</span>
              <span>Complexity: ${e.complexity}</span>
              <span class="${statusClass(e.status)}">${e.status.toUpperCase()}</span>
            </div>
          </div>
          <div class="tool-item-actions">
            ${e.status === 'live' ? '<button class="tool-btn">Launch</button>' : e.status === 'beta' ? '<button class="tool-btn outline">Join Beta</button>' : '<button class="tool-btn outline" disabled style="opacity:0.4;cursor:default;">Coming Soon</button>'}
          </div>
        </div>
      `).join('')}
    `;
  }

  /* ─────────────────────────────────────────────
     4. COLLABORATION NETWORK
     ───────────────────────────────────────────── */
  function initCollab(el) {
    const teams = [
      { icon: '\u{1F441}', name: 'Vision Research Group',    members: 14, datasets: 8,  focus: 'Computer Vision, Object Detection, Scene Understanding', activity: 92 },
      { icon: '\u{1F9BE}', name: 'Embodied AI Lab',          members: 9,  datasets: 5,  focus: 'Locomotion, Manipulation, Motor Control', activity: 87 },
      { icon: '\u{1F9E0}', name: 'Cognitive Architecture',   members: 7,  datasets: 3,  focus: 'Modular Mind, Planning, Reasoning', activity: 74 },
      { icon: '\u{1F50A}', name: 'Speech & Language',         members: 11, datasets: 6,  focus: 'ASR, NLP, Multi-language Processing', activity: 68 },
      { icon: '\u{1F4A1}', name: 'Sim-to-Real Transfer',     members: 6,  datasets: 4,  focus: 'Domain Adaptation, Physics Simulation, Deployment', activity: 81 },
    ];

    el.innerHTML = `
      <div class="tool-stat-grid">
        <div class="tool-stat-box"><div class="tool-stat-val">47</div><div class="tool-stat-lbl">Researchers</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--accent2)">5</div><div class="tool-stat-lbl">Active Teams</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--gold)">26</div><div class="tool-stat-lbl">Shared Datasets</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--purple)">138</div><div class="tool-stat-lbl">Experiments</div></div>
      </div>
      <span class="tool-label">Research Teams</span>
      ${teams.map(t => `
        <div class="tool-item-row">
          <div class="tool-item-icon">${t.icon}</div>
          <div class="tool-item-body">
            <div class="tool-item-name">${t.name}</div>
            <div class="tool-item-desc">${t.focus}</div>
            <div class="tool-item-meta">
              <span>${t.members} members</span>
              <span>${t.datasets} datasets</span>
            </div>
            <div style="margin-top:6px;">
              <span class="tool-label" style="margin-bottom:2px;display:inline;font-size:8px;">Activity ${t.activity}%</span>
              <div class="tool-progress-bar"><div class="tool-progress-fill" style="width:${t.activity}%;background:${t.activity > 80 ? 'var(--accent2)' : t.activity > 60 ? 'var(--accent)' : 'var(--gold)'};"></div></div>
            </div>
          </div>
          <div class="tool-item-actions">
            <button class="tool-btn">Join</button>
            <button class="tool-btn outline">View</button>
          </div>
        </div>
      `).join('')}
    `;
  }

  /* ─────────────────────────────────────────────
     5. RESEARCH DAO
     ───────────────────────────────────────────── */
  function initDAO(el) {
    const proposals = [
      { id: 'SYP-042', title: 'Allocate 500K $SYNX to H100 cluster expansion', status: 'active',   votesFor: 72, votesAgainst: 18, quorum: 90, ends: '3d 14h' },
      { id: 'SYP-041', title: 'Fund multi-language ASR research grant',         status: 'active',   votesFor: 58, votesAgainst: 12, quorum: 70, ends: '5d 02h' },
      { id: 'SYP-040', title: 'Open-source vision-backbone-v1 weights',         status: 'passed',   votesFor: 91, votesAgainst: 4,  quorum: 95, ends: 'Ended' },
      { id: 'SYP-039', title: 'Increase community module reward pool by 25%',   status: 'passed',   votesFor: 84, votesAgainst: 8,  quorum: 92, ends: 'Ended' },
      { id: 'SYP-038', title: 'Partner with Akash Network for burst compute',   status: 'rejected', votesFor: 32, votesAgainst: 55, quorum: 87, ends: 'Ended' },
    ];

    el.innerHTML = `
      <div class="tool-stat-grid">
        <div class="tool-stat-box"><div class="tool-stat-val">42</div><div class="tool-stat-lbl">Total Proposals</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--accent2)">2</div><div class="tool-stat-lbl">Active Votes</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--gold)">2.4M</div><div class="tool-stat-lbl">Treasury ($SYNX)</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--purple)">156</div><div class="tool-stat-lbl">Voting Members</div></div>
      </div>
      <span class="tool-label">Governance Proposals</span>
      ${proposals.map(p => {
        const total = p.votesFor + p.votesAgainst;
        const pctFor = Math.round(p.votesFor / total * 100);
        const statusColor = p.status === 'active' ? 'var(--accent)' : p.status === 'passed' ? 'var(--accent2)' : 'var(--accent3)';
        return `
        <div class="tool-item-row">
          <div class="tool-item-body" style="width:100%;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <div class="tool-item-name">${p.id}: ${p.title}</div>
              <span style="font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:${statusColor};background:${statusColor}15;border:1px solid ${statusColor}30;padding:2px 8px;border-radius:4px;">${p.status}</span>
            </div>
            <div class="tool-item-meta" style="margin-top:8px;">
              <span style="color:var(--accent2)">For: ${p.votesFor}%</span>
              <span style="color:var(--accent3)">Against: ${p.votesAgainst}%</span>
              <span>Quorum: ${p.quorum}%</span>
              <span>${p.ends === 'Ended' ? 'Ended' : 'Ends in ' + p.ends}</span>
            </div>
            <div style="display:flex;height:6px;border-radius:3px;overflow:hidden;margin-top:8px;background:var(--surface2);">
              <div style="width:${pctFor}%;background:var(--accent2);border-radius:3px 0 0 3px;"></div>
              <div style="width:${100 - pctFor}%;background:var(--accent3);border-radius:0 3px 3px 0;"></div>
            </div>
            ${p.status === 'active' ? '<div style="margin-top:10px;display:flex;gap:6px;"><button class="tool-btn">Vote For</button><button class="tool-btn outline">Vote Against</button></div>' : ''}
          </div>
        </div>`;
      }).join('')}
    `;
  }

  /* ─────────────────────────────────────────────
     6. IP PROTECTION
     ───────────────────────────────────────────── */
  function initIP(el) {
    const records = [
      { hash: '0x7a3f...c4e2', title: 'Face Recognition v2 Model',      owner: 'synx-researcher-alpha', license: 'MIT',        date: '2026-03-10', status: 'verified' },
      { hash: '0x9d1b...a7f3', title: 'Motor Control RL Weights',       owner: 'synx-lab-embodied',     license: 'Apache 2.0', date: '2026-03-08', status: 'verified' },
      { hash: '0x2e8c...d5b1', title: 'Perception Fusion Architecture', owner: 'synx-researcher-beta',  license: 'GPL v3',     date: '2026-03-05', status: 'verified' },
      { hash: '0x6f4a...e9c7', title: 'Urban Navigation Dataset',       owner: 'synx-data-collective',  license: 'CC BY 4.0',  date: '2026-03-01', status: 'verified' },
      { hash: '0xb3d7...f2a8', title: 'ASR Multi-Lang Training Pipeline',owner: 'synx-speech-team',     license: 'MIT',        date: '2026-02-25', status: 'pending' },
    ];

    el.innerHTML = `
      <div class="tool-stat-grid">
        <div class="tool-stat-box"><div class="tool-stat-val">48</div><div class="tool-stat-lbl">Registered IPs</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--accent2)">45</div><div class="tool-stat-lbl">Verified</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--gold)">12</div><div class="tool-stat-lbl">Active Licenses</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" style="color:var(--purple)">3.2K</div><div class="tool-stat-lbl">$SYNX Earned</div></div>
      </div>
      <span class="tool-label">On-Chain IP Registry</span>
      <div class="tool-overflow-x">
      <table class="tool-table">
        <thead><tr>
          <th>TX Hash</th><th>Research Output</th><th>Owner</th><th>License</th><th>Date</th><th>Status</th>
        </tr></thead>
        <tbody>
          ${records.map(r => `<tr>
            <td class="accent-val">${r.hash}</td>
            <td>${r.title}</td>
            <td style="color:var(--body);">${r.owner}</td>
            <td><span class="tool-tag">${r.license}</span></td>
            <td style="color:var(--muted);">${r.date}</td>
            <td class="${r.status === 'verified' ? 'status-on' : 'gold-val'}">${r.status === 'verified' ? '\u2713 VERIFIED' : '\u25CB PENDING'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      </div>
      <div class="tool-section-title">Register New IP</div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:20px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <span class="tool-label">Research Output Name</span>
            <input type="text" placeholder="e.g. My Model v1" style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:'DM Mono',monospace;font-size:12px;padding:8px 12px;outline:none;">
          </div>
          <div>
            <span class="tool-label">License Type</span>
            <select style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:'DM Mono',monospace;font-size:12px;padding:8px 12px;outline:none;appearance:none;">
              <option>MIT</option>
              <option>Apache 2.0</option>
              <option>GPL v3</option>
              <option>CC BY 4.0</option>
              <option>Proprietary</option>
            </select>
          </div>
        </div>
        <div style="margin-top:12px;">
          <span class="tool-label">Description</span>
          <textarea placeholder="Describe your research output..." style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:'DM Mono',monospace;font-size:12px;padding:8px 12px;outline:none;resize:vertical;min-height:60px;"></textarea>
        </div>
        <div style="margin-top:14px;">
          <button class="tool-btn">Register on Chain</button>
        </div>
      </div>
    `;
  }

})();
