/* ═══════════════════════════════════════════════════
   SYNAPEX LAB TOOLS — Interactive Research Utilities
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  const toolCards = document.querySelectorAll('.tool-card[data-tool]');
  const workspace = document.getElementById('toolWorkspace');
  const toolBody = document.getElementById('toolBody');
  const toolIcon = document.getElementById('toolIcon');
  const toolTitle = document.getElementById('toolTitle');
  const closeBtn = document.getElementById('toolCloseBtn');

  if (!toolCards.length || !workspace) return;

  let activeTool = null;
  let timerInterval = null;

  const TOOLS = {
    palette: { icon: '\u{1F3A8}', title: 'Color Palette Generator', init: initPalette },
    json:    { icon: '\u{1F4C4}', title: 'JSON Formatter',          init: initJSON },
    base64:  { icon: '\u{1F512}', title: 'Base64 Encoder / Decoder', init: initBase64 },
    textanalyzer: { icon: '\u{1F4D1}', title: 'Text Analyzer',      init: initTextAnalyzer },
    timer:   { icon: '\u23F1',    title: 'Stopwatch',                init: initTimer },
    password:{ icon: '\u{1F510}', title: 'Password Generator',      init: initPassword }
  };

  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.tool;
      if (activeTool === key) {
        closeTool();
        return;
      }
      openTool(key);
    });
  });

  closeBtn.addEventListener('click', closeTool);

  function openTool(key) {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    const t = TOOLS[key];
    if (!t) return;

    activeTool = key;
    toolCards.forEach(c => c.classList.toggle('active', c.dataset.tool === key));
    toolIcon.textContent = t.icon;
    toolTitle.textContent = t.title;
    toolBody.innerHTML = '';
    t.init(toolBody);
    workspace.classList.add('visible');
    workspace.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closeTool() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    activeTool = null;
    toolCards.forEach(c => c.classList.remove('active'));
    workspace.classList.remove('visible');
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard'));
  }

  function showToast(msg) {
    let toast = document.querySelector('.copy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'copy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }

  /* ─────────────────────────────────────────────
     TOOL 1: Color Palette Generator
     ───────────────────────────────────────────── */
  function initPalette(container) {
    const modes = ['Random', 'Warm', 'Cool', 'Pastel', 'Neon', 'Monochrome'];

    container.innerHTML = `
      <div class="tool-row">
        <div>
          <label class="tool-label">Palette Mode</label>
          <select class="tool-select" id="paletteMode">
            ${modes.map(m => `<option value="${m.toLowerCase()}">${m}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="tool-label">Colors Count</label>
          <input type="number" class="tool-input" id="paletteCount" value="5" min="2" max="12">
        </div>
      </div>
      <div class="tool-actions">
        <button class="tool-btn" id="paletteGenBtn">Generate Palette</button>
        <button class="tool-btn secondary" id="paletteCopyBtn">Copy CSS</button>
      </div>
      <div class="color-palette" id="paletteDisplay"></div>
      <div class="tool-output empty" id="paletteCss" style="margin-top:16px;">CSS output will appear here</div>
    `;

    let colors = [];

    document.getElementById('paletteGenBtn').addEventListener('click', generate);
    document.getElementById('paletteCopyBtn').addEventListener('click', () => {
      const css = document.getElementById('paletteCss').textContent;
      if (css && colors.length) copyToClipboard(css);
    });

    generate();

    function generate() {
      const mode = document.getElementById('paletteMode').value;
      const count = Math.min(12, Math.max(2, parseInt(document.getElementById('paletteCount').value) || 5));
      colors = [];
      for (let i = 0; i < count; i++) colors.push(genColor(mode, i, count));

      const display = document.getElementById('paletteDisplay');
      display.innerHTML = colors.map(c =>
        `<div class="color-swatch" style="background:${c}" onclick="navigator.clipboard.writeText('${c}')">
           <span class="color-swatch-label">${c}</span>
         </div>`
      ).join('');

      const cssOut = document.getElementById('paletteCss');
      cssOut.className = 'tool-output';
      cssOut.textContent = ':root {\n' + colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + '\n}';
    }

    function genColor(mode, idx, total) {
      let h, s, l;
      switch (mode) {
        case 'warm':
          h = rand(0, 60); s = rand(60, 90); l = rand(40, 65); break;
        case 'cool':
          h = rand(180, 280); s = rand(50, 85); l = rand(40, 65); break;
        case 'pastel':
          h = rand(0, 360); s = rand(40, 70); l = rand(70, 88); break;
        case 'neon':
          h = rand(0, 360); s = rand(90, 100); l = rand(50, 65); break;
        case 'monochrome':
          h = rand(200, 240);
          s = rand(60, 80);
          l = 25 + (idx / Math.max(total - 1, 1)) * 55;
          break;
        default:
          h = rand(0, 360); s = rand(50, 90); l = rand(35, 70);
      }
      return hslToHex(h, s, l);
    }

    function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    function hslToHex(h, s, l) {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    }
  }

  /* ─────────────────────────────────────────────
     TOOL 2: JSON Formatter
     ───────────────────────────────────────────── */
  function initJSON(container) {
    container.innerHTML = `
      <div class="tool-row single">
        <div>
          <label class="tool-label">Input JSON</label>
          <textarea class="tool-textarea" id="jsonInput" placeholder='{"key": "value", "array": [1,2,3]}'></textarea>
        </div>
      </div>
      <div class="tool-row">
        <div>
          <label class="tool-label">Indent</label>
          <select class="tool-select" id="jsonIndent">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </div>
        <div style="display:flex;align-items:flex-end;">
          <div class="tool-actions" style="margin-top:0;">
            <button class="tool-btn" id="jsonFormatBtn">Format</button>
            <button class="tool-btn secondary" id="jsonMinBtn">Minify</button>
            <button class="tool-btn secondary" id="jsonCopyBtn">Copy</button>
          </div>
        </div>
      </div>
      <span class="tool-output-label">Output</span>
      <div class="tool-output empty" id="jsonOutput">Formatted output will appear here</div>
    `;

    document.getElementById('jsonFormatBtn').addEventListener('click', () => {
      const input = document.getElementById('jsonInput').value.trim();
      const out = document.getElementById('jsonOutput');
      if (!input) { out.className = 'tool-output empty'; out.textContent = 'Enter JSON above'; return; }
      try {
        const parsed = JSON.parse(input);
        const indent = document.getElementById('jsonIndent').value;
        const space = indent === 'tab' ? '\t' : parseInt(indent);
        out.className = 'tool-output';
        out.textContent = JSON.stringify(parsed, null, space);
      } catch (e) {
        out.className = 'tool-output';
        out.style.color = 'var(--accent3)';
        out.textContent = 'Error: ' + e.message;
        setTimeout(() => out.style.color = '', 3000);
      }
    });

    document.getElementById('jsonMinBtn').addEventListener('click', () => {
      const input = document.getElementById('jsonInput').value.trim();
      const out = document.getElementById('jsonOutput');
      if (!input) return;
      try {
        out.className = 'tool-output';
        out.textContent = JSON.stringify(JSON.parse(input));
      } catch (e) {
        out.className = 'tool-output';
        out.style.color = 'var(--accent3)';
        out.textContent = 'Error: ' + e.message;
        setTimeout(() => out.style.color = '', 3000);
      }
    });

    document.getElementById('jsonCopyBtn').addEventListener('click', () => {
      const text = document.getElementById('jsonOutput').textContent;
      if (text) copyToClipboard(text);
    });
  }

  /* ─────────────────────────────────────────────
     TOOL 3: Base64 Encoder / Decoder
     ───────────────────────────────────────────── */
  function initBase64(container) {
    container.innerHTML = `
      <div class="tool-row single">
        <div>
          <label class="tool-label">Input Text</label>
          <textarea class="tool-textarea" id="b64Input" placeholder="Type or paste text here..."></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="tool-btn" id="b64EncBtn">Encode</button>
        <button class="tool-btn secondary" id="b64DecBtn">Decode</button>
        <button class="tool-btn secondary" id="b64CopyBtn">Copy Output</button>
      </div>
      <span class="tool-output-label">Result</span>
      <div class="tool-output empty" id="b64Output">Result will appear here</div>
    `;

    document.getElementById('b64EncBtn').addEventListener('click', () => {
      const input = document.getElementById('b64Input').value;
      const out = document.getElementById('b64Output');
      if (!input) { out.className = 'tool-output empty'; out.textContent = 'Enter text above'; return; }
      try {
        out.className = 'tool-output';
        out.textContent = btoa(unescape(encodeURIComponent(input)));
      } catch (e) {
        out.textContent = 'Encoding error: ' + e.message;
      }
    });

    document.getElementById('b64DecBtn').addEventListener('click', () => {
      const input = document.getElementById('b64Input').value.trim();
      const out = document.getElementById('b64Output');
      if (!input) { out.className = 'tool-output empty'; out.textContent = 'Enter Base64 above'; return; }
      try {
        out.className = 'tool-output';
        out.textContent = decodeURIComponent(escape(atob(input)));
      } catch (e) {
        out.className = 'tool-output';
        out.style.color = 'var(--accent3)';
        out.textContent = 'Invalid Base64 input: ' + e.message;
        setTimeout(() => out.style.color = '', 3000);
      }
    });

    document.getElementById('b64CopyBtn').addEventListener('click', () => {
      const text = document.getElementById('b64Output').textContent;
      if (text) copyToClipboard(text);
    });
  }

  /* ─────────────────────────────────────────────
     TOOL 4: Text Analyzer
     ───────────────────────────────────────────── */
  function initTextAnalyzer(container) {
    container.innerHTML = `
      <div class="tool-row single">
        <div>
          <label class="tool-label">Enter or paste text</label>
          <textarea class="tool-textarea" id="taInput" placeholder="Start typing or paste any text to analyze..." style="min-height:150px;"></textarea>
        </div>
      </div>
      <div class="tool-stat-grid" id="taStats">
        <div class="tool-stat-box"><div class="tool-stat-val" id="taSChars">0</div><div class="tool-stat-lbl">Characters</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" id="taSCharsNS">0</div><div class="tool-stat-lbl">No Spaces</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" id="taSWords">0</div><div class="tool-stat-lbl">Words</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" id="taSSent">0</div><div class="tool-stat-lbl">Sentences</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" id="taSPara">0</div><div class="tool-stat-lbl">Paragraphs</div></div>
        <div class="tool-stat-box"><div class="tool-stat-val" id="taSRead">0</div><div class="tool-stat-lbl">Read Time (min)</div></div>
      </div>
      <span class="tool-output-label">Top Words</span>
      <div class="tool-output empty" id="taTopWords">Word frequency will appear as you type</div>
    `;

    const input = document.getElementById('taInput');
    input.addEventListener('input', analyze);

    function analyze() {
      const text = input.value;
      const chars = text.length;
      const charsNS = text.replace(/\s/g, '').length;
      const words = text.trim() ? text.trim().split(/\s+/) : [];
      const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
      const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
      const readTime = Math.max(1, Math.ceil(words.length / 200));

      document.getElementById('taSChars').textContent = chars;
      document.getElementById('taSCharsNS').textContent = charsNS;
      document.getElementById('taSWords').textContent = words.length;
      document.getElementById('taSSent').textContent = sentences;
      document.getElementById('taSPara').textContent = paragraphs || (text.trim() ? 1 : 0);
      document.getElementById('taSRead').textContent = text.trim() ? readTime : 0;

      const freq = {};
      words.forEach(w => {
        const lw = w.toLowerCase().replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '');
        if (lw.length > 1) freq[lw] = (freq[lw] || 0) + 1;
      });
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const topEl = document.getElementById('taTopWords');
      if (sorted.length) {
        topEl.className = 'tool-output';
        topEl.textContent = sorted.map(([w, c]) => `${w}: ${c}`).join('  |  ');
      } else {
        topEl.className = 'tool-output empty';
        topEl.textContent = 'Word frequency will appear as you type';
      }
    }
  }

  /* ─────────────────────────────────────────────
     TOOL 5: Stopwatch
     ───────────────────────────────────────────── */
  function initTimer(container) {
    container.innerHTML = `
      <div class="timer-display" id="timerDisplay">00:00:00<span class="timer-ms">.000</span></div>
      <div class="tool-actions" style="justify-content:center;">
        <button class="tool-btn" id="timerStartBtn">Start</button>
        <button class="tool-btn secondary" id="timerLapBtn">Lap</button>
        <button class="tool-btn secondary" id="timerResetBtn">Reset</button>
      </div>
      <span class="tool-output-label" id="timerLapsLabel" style="display:none;">Laps</span>
      <div class="tool-output" id="timerLaps" style="display:none;"></div>
    `;

    let startTime = 0;
    let elapsed = 0;
    let running = false;
    let laps = [];

    const display = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('timerStartBtn');
    const lapBtn = document.getElementById('timerLapBtn');
    const resetBtn = document.getElementById('timerResetBtn');

    startBtn.addEventListener('click', () => {
      if (running) {
        running = false;
        clearInterval(timerInterval);
        timerInterval = null;
        elapsed += Date.now() - startTime;
        startBtn.textContent = 'Resume';
      } else {
        running = true;
        startTime = Date.now();
        startBtn.textContent = 'Pause';
        timerInterval = setInterval(updateDisplay, 31);
      }
    });

    lapBtn.addEventListener('click', () => {
      if (!running && elapsed === 0) return;
      const total = running ? elapsed + (Date.now() - startTime) : elapsed;
      laps.push(total);
      renderLaps();
    });

    resetBtn.addEventListener('click', () => {
      running = false;
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      elapsed = 0;
      laps = [];
      startBtn.textContent = 'Start';
      display.innerHTML = '00:00:00<span class="timer-ms">.000</span>';
      document.getElementById('timerLaps').style.display = 'none';
      document.getElementById('timerLapsLabel').style.display = 'none';
    });

    function updateDisplay() {
      const total = elapsed + (Date.now() - startTime);
      display.innerHTML = formatTime(total);
    }

    function formatTime(ms) {
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const mil = ms % 1000;
      return `${pad(h)}:${pad(m)}:${pad(s)}<span class="timer-ms">.${String(mil).padStart(3, '0')}</span>`;
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function renderLaps() {
      const el = document.getElementById('timerLaps');
      const label = document.getElementById('timerLapsLabel');
      label.style.display = 'block';
      el.style.display = 'block';
      el.innerHTML = laps.map((t, i) => {
        const diff = i > 0 ? t - laps[i - 1] : t;
        return `Lap ${i + 1}: ${formatTimeText(t)}  (+${formatTimeText(diff)})`;
      }).reverse().join('\n');
    }

    function formatTimeText(ms) {
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const mil = ms % 1000;
      return `${pad(m)}:${pad(s)}.${String(mil).padStart(3, '0')}`;
    }
  }

  /* ─────────────────────────────────────────────
     TOOL 6: Password Generator
     ───────────────────────────────────────────── */
  function initPassword(container) {
    container.innerHTML = `
      <div class="tool-row">
        <div>
          <label class="tool-label">Length</label>
          <input type="range" id="pwdLength" min="4" max="64" value="20" class="tool-input" style="padding:6px 0;cursor:pointer;">
          <div style="text-align:center;font-family:'DM Mono',monospace;font-size:13px;color:var(--accent);margin-top:4px;" id="pwdLenVal">20</div>
        </div>
        <div>
          <label class="tool-label">Options</label>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <label style="display:flex;align-items:center;gap:8px;font-family:'DM Mono',monospace;font-size:12px;color:var(--body);cursor:pointer;">
              <input type="checkbox" id="pwdUpper" checked> Uppercase (A-Z)
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-family:'DM Mono',monospace;font-size:12px;color:var(--body);cursor:pointer;">
              <input type="checkbox" id="pwdLower" checked> Lowercase (a-z)
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-family:'DM Mono',monospace;font-size:12px;color:var(--body);cursor:pointer;">
              <input type="checkbox" id="pwdDigits" checked> Digits (0-9)
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-family:'DM Mono',monospace;font-size:12px;color:var(--body);cursor:pointer;">
              <input type="checkbox" id="pwdSymbols" checked> Symbols (!@#$...)
            </label>
          </div>
        </div>
      </div>
      <div class="password-result" id="pwdResult">-</div>
      <div class="password-strength"><div class="password-strength-bar" id="pwdStrengthBar"></div></div>
      <div style="text-align:center;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;color:var(--muted);margin-bottom:16px;" id="pwdStrengthText">STRENGTH: —</div>
      <div class="tool-actions" style="justify-content:center;">
        <button class="tool-btn" id="pwdGenBtn">Generate</button>
        <button class="tool-btn secondary" id="pwdCopyBtn">Copy</button>
      </div>
    `;

    const lenSlider = document.getElementById('pwdLength');
    const lenVal = document.getElementById('pwdLenVal');
    lenSlider.addEventListener('input', () => { lenVal.textContent = lenSlider.value; });

    document.getElementById('pwdGenBtn').addEventListener('click', generate);
    document.getElementById('pwdCopyBtn').addEventListener('click', () => {
      const text = document.getElementById('pwdResult').textContent;
      if (text && text !== '-') copyToClipboard(text);
    });

    generate();

    function generate() {
      const len = parseInt(lenSlider.value);
      let charset = '';
      if (document.getElementById('pwdUpper').checked)   charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (document.getElementById('pwdLower').checked)    charset += 'abcdefghijklmnopqrstuvwxyz';
      if (document.getElementById('pwdDigits').checked)   charset += '0123456789';
      if (document.getElementById('pwdSymbols').checked)  charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

      const arr = new Uint32Array(len);
      crypto.getRandomValues(arr);
      let pwd = '';
      for (let i = 0; i < len; i++) pwd += charset[arr[i] % charset.length];

      document.getElementById('pwdResult').textContent = pwd;

      const poolSize = charset.length;
      const entropy = len * Math.log2(poolSize);
      const bar = document.getElementById('pwdStrengthBar');
      const text = document.getElementById('pwdStrengthText');
      let pct, color, label;
      if (entropy < 28)       { pct = 15;  color = 'var(--accent3)'; label = 'VERY WEAK'; }
      else if (entropy < 36)  { pct = 30;  color = '#ff8844';        label = 'WEAK'; }
      else if (entropy < 60)  { pct = 50;  color = 'var(--gold)';    label = 'FAIR'; }
      else if (entropy < 80)  { pct = 75;  color = 'var(--accent)';  label = 'STRONG'; }
      else                    { pct = 100; color = 'var(--accent2)';  label = 'VERY STRONG'; }

      bar.style.width = pct + '%';
      bar.style.background = color;
      text.textContent = `STRENGTH: ${label}  (${Math.round(entropy)} bits)`;
    }
  }

})();
