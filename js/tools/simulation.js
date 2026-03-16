/* SYNAPEX LAB — Simulation Tool */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initSimulation = function (el) {
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
};
