/* ═══════════════════════════════════════════════════
   SYNAPEX LAB — Shared UI Helpers
   Used by all module and tool programs.
   ═══════════════════════════════════════════════════ */

window.SynapexLab = window.SynapexLab || {};

SynapexLab.toggle = function (id, label, sub, checked) {
  return `<div class="tm-toggle-row">
    <div><div class="tm-toggle-text">${label}</div>${sub ? `<div class="tm-toggle-sub">${sub}</div>` : ''}</div>
    <label class="tm-toggle"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''}><span class="tm-toggle-track"></span><span class="tm-toggle-thumb"></span></label>
  </div>`;
};

SynapexLab.range = function (id, label, min, max, val, step, unit) {
  return `<div class="tm-param-row">
    <span class="tm-param-label">${label}</span>
    <div class="tm-param-ctrl">
      <div class="tm-range-wrap">
        <input type="range" class="tm-range" id="${id}" min="${min}" max="${max}" value="${val}" step="${step || 1}">
        <span class="tm-range-val" id="${id}Val">${val}${unit || ''}</span>
      </div>
    </div>
  </div>`;
};

SynapexLab.sel = function (id, label, options) {
  return `<div class="tm-param-row">
    <span class="tm-param-label">${label}</span>
    <div class="tm-param-ctrl">
      <select class="tm-input" id="${id}">${options.map(o => {
        const v = typeof o === 'string' ? o : o.v;
        const t = typeof o === 'string' ? o : o.t;
        const s = typeof o === 'object' && o.s ? ' selected' : '';
        return `<option value="${v}"${s}>${t}</option>`;
      }).join('')}</select>
    </div>
  </div>`;
};

SynapexLab.num = function (id, label, val, min, max, step) {
  return `<div class="tm-param-row">
    <span class="tm-param-label">${label}</span>
    <div class="tm-param-ctrl">
      <input type="number" class="tm-input" id="${id}" value="${val}" min="${min}" max="${max}" step="${step || 1}">
    </div>
  </div>`;
};

SynapexLab.wireRanges = function (el) {
  el.querySelectorAll('.tm-range').forEach(r => {
    const valEl = document.getElementById(r.id + 'Val');
    if (!valEl) return;
    const unit = valEl.textContent.replace(/[\d.\-]/g, '');
    r.addEventListener('input', () => { valEl.textContent = r.value + unit; });
  });
};

SynapexLab.openModal = function (icon, title, subtitle, initFn) {
  const backdrop = document.getElementById('toolModalBackdrop');
  const body = document.getElementById('toolModalBody');
  if (!backdrop || !body) return;
  document.getElementById('toolModalIcon').textContent = icon;
  document.getElementById('toolModalTitle').textContent = title;
  document.getElementById('toolModalSubtitle').textContent = subtitle;
  body.innerHTML = '';
  initFn(body);
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => backdrop.classList.add('visible'));
  });
};

SynapexLab.closeModal = function () {
  const backdrop = document.getElementById('toolModalBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('visible');
  setTimeout(() => {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    const body = document.getElementById('toolModalBody');
    if (body) body.innerHTML = '';
  }, 360);
};

(function () {
  const closeBtn = document.getElementById('toolModalClose');
  const backdrop = document.getElementById('toolModalBackdrop');
  if (closeBtn) closeBtn.addEventListener('click', SynapexLab.closeModal);
  if (backdrop) backdrop.addEventListener('click', e => {
    if (e.target === backdrop) SynapexLab.closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('open')) SynapexLab.closeModal();
  });
})();
