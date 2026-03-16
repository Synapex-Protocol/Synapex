/* SYNAPEX LAB — IP Tool */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initIP = function (el) {
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
};
