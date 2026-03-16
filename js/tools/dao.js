/* SYNAPEX LAB — DAO Tool */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initDAO = function (el) {
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
};
