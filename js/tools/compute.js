/* SYNAPEX LAB — Compute Tool */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initCompute = function (el) {
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
};
