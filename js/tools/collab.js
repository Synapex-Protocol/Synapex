/* SYNAPEX LAB — Collaboration Tool */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initCollab = function (el) {
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
};
