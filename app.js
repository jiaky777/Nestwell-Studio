// Curtain Measurement Tool — local clone of Curtarra's 7-step wizard
'use strict';

// ---------- Data ----------
const HEADER_STYLES = [
  { id: 'grommet',     name: 'Grommet Top',          desc: 'Most popular for contemporary spaces.', rec: 2,   supports: ['rod'],          img: 'assets/headers/grommet.png' },
  { id: 'rod_pocket',  name: 'Rod Pocket',           desc: 'Lined top for a clean tailored look.',  rec: 2,   supports: ['rod'],          img: 'assets/headers/rod_pocket.png' },
  { id: 'pinch_dbl',   name: 'Pinch Pleat',          desc: 'Formal and elegant.',                   rec: 2.5, supports: ['rod','track'],  img: 'assets/headers/pinch_dbl.png' },
  { id: 'back_tab',    name: 'Back Tab',             desc: 'Soft, crisp touch with hidden tabs.',   rec: 2,   supports: ['rod'],          img: 'assets/headers/back_tab.png' },
  { id: 'tab_top',     name: 'Tab Top',              desc: 'Informal, country / transitional decor.', rec: 1.5, supports: ['rod'],        img: 'assets/headers/tab_top.png' },
  { id: 'flat_panel',  name: 'Flat Panel',           desc: 'Casual & modern. Uses 4-in-1 tape.',    rec: 2,   supports: ['rod'],          img: 'assets/headers/flat_panel.png' },
  { id: 'ripple_fold', name: 'Ripple Fold',          desc: 'It brings a polished look with clean s-folds.', rec: 2, supports: ['track'],  img: 'assets/headers/ripple_fold.jpg' },
];

const RODS = [
  { id: 'single',  type: 'rod',   name: 'Single Rod',      desc: 'Standard for classic single panels.',      img: 'assets/rods/single.jpg' },
  { id: 'double',  type: 'rod',   name: 'Double Rod',      desc: 'Layer sheers and drapes.',                 img: 'assets/rods/double.jpg' },
  { id: 'track',   type: 'track', name: 'Ceiling Track',   desc: 'For wave headings and modern minimalism.', img: 'assets/rods/track.jpg' },
  { id: 'wand',    type: 'track', name: 'Wand-Draw Track', desc: 'Seamless operation, no rings.',            img: 'assets/rods/wand.jpg' },
  { id: 'tension', type: 'rod',   name: 'Tension Rod',     desc: 'Drill-free, interior mounting.',           img: 'assets/rods/tension.jpg' },
];

// ---------- State ----------
const state = {
  step: 1,
  unit: 'in',
  header: null,
  rod: null,
  windowWidth: 60,
  extension: 8,
  rodToFloor: 96,
  bottomStyle: '0.5',   // numeric offset (in inches) OR 'sill'
  customLength: null,
  panels: 2,
  fullness: 2,
};

// Simple inline SVG illustrations per header style — keeps the tool fully offline.
function svgFor(id) {
  const common = `<defs><pattern id="lin" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0" stroke="#b8a47a" stroke-width="1" opacity=".5"/></pattern></defs>`;
  const rod = `<rect x="6" y="14" width="148" height="4" rx="2" fill="#3b3a35"/><circle cx="8" cy="16" r="5" fill="#3b3a35"/><circle cx="152" cy="16" r="5" fill="#3b3a35"/>`;
  const drape = (top) => `<path d="M14 ${top} Q22 95 18 100 Q26 60 30 100 Q38 65 42 100 Q50 60 54 100 Q62 65 66 100 Q74 60 78 100 Q86 65 90 100 Q98 60 102 100 Q110 65 114 100 Q122 60 126 100 Q134 65 138 100 Q146 60 146 ${top} Z" fill="url(#lin)" stroke="#7a6a3f" stroke-width="1"/>`;
  switch (id) {
    case 'grommet':
      return `<svg viewBox="0 0 160 110">${common}${rod}<g>${drape(22)}</g><g fill="none" stroke="#3b3a35" stroke-width="1.2"><circle cx="26" cy="20" r="3"/><circle cx="46" cy="20" r="3"/><circle cx="66" cy="20" r="3"/><circle cx="86" cy="20" r="3"/><circle cx="106" cy="20" r="3"/><circle cx="126" cy="20" r="3"/></g></svg>`;
    case 'rod_pocket':
      return `<svg viewBox="0 0 160 110">${common}${rod}${drape(20)}<rect x="14" y="20" width="132" height="8" fill="#a48b56" opacity=".5"/></svg>`;
    case 'pinch_dbl':
      return `<svg viewBox="0 0 160 110">${common}${rod}${drape(22)}<g fill="#7a6a3f"><path d="M28 22 l-3 8 h6z"/><path d="M58 22 l-3 8 h6z"/><path d="M88 22 l-3 8 h6z"/><path d="M118 22 l-3 8 h6z"/></g></svg>`;
    case 'pinch_tri':
      return `<svg viewBox="0 0 160 110">${common}${rod}${drape(22)}<g fill="#7a6a3f"><path d="M28 22 l-4 10 h8z"/><path d="M58 22 l-4 10 h8z"/><path d="M88 22 l-4 10 h8z"/><path d="M118 22 l-4 10 h8z"/></g></svg>`;
    case 'back_tab':
      return `<svg viewBox="0 0 160 110">${common}${rod}<g>${drape(24)}</g><rect x="14" y="22" width="132" height="3" fill="#7a6a3f" opacity=".4"/></svg>`;
    case 'tab_top':
      return `<svg viewBox="0 0 160 110">${common}${rod}<g fill="#7a6a3f"><rect x="22" y="10" width="6" height="14" rx="2"/><rect x="50" y="10" width="6" height="14" rx="2"/><rect x="78" y="10" width="6" height="14" rx="2"/><rect x="106" y="10" width="6" height="14" rx="2"/><rect x="134" y="10" width="6" height="14" rx="2"/></g>${drape(24)}</svg>`;
    case 'flat_panel':
      return `<svg viewBox="0 0 160 110">${common}${rod}<rect x="14" y="20" width="132" height="80" fill="url(#lin)" stroke="#7a6a3f"/></svg>`;
    case 'ripple_fold':
      return `<svg viewBox="0 0 160 110">${common}<rect x="0" y="14" width="160" height="3" fill="#3b3a35"/><path d="M6 18 Q14 60 18 100 Q26 60 30 100 Q38 60 42 100 Q50 60 54 100 Q62 60 66 100 Q74 60 78 100 Q86 60 90 100 Q98 60 102 100 Q110 60 114 100 Q122 60 126 100 Q134 60 138 100 Q146 60 154 18 Z" fill="url(#lin)" stroke="#7a6a3f"/></svg>`;
    case 'pencil':
      return `<svg viewBox="0 0 160 110">${common}${rod}${drape(22)}<g stroke="#7a6a3f" stroke-width="1"><line x1="20" y1="22" x2="20" y2="32"/><line x1="28" y1="22" x2="28" y2="32"/><line x1="36" y1="22" x2="36" y2="32"/><line x1="44" y1="22" x2="44" y2="32"/><line x1="52" y1="22" x2="52" y2="32"/><line x1="60" y1="22" x2="60" y2="32"/><line x1="68" y1="22" x2="68" y2="32"/><line x1="76" y1="22" x2="76" y2="32"/><line x1="84" y1="22" x2="84" y2="32"/><line x1="92" y1="22" x2="92" y2="32"/><line x1="100" y1="22" x2="100" y2="32"/><line x1="108" y1="22" x2="108" y2="32"/><line x1="116" y1="22" x2="116" y2="32"/><line x1="124" y1="22" x2="124" y2="32"/><line x1="132" y1="22" x2="132" y2="32"/><line x1="140" y1="22" x2="140" y2="32"/></g></svg>`;
    default: return `<svg viewBox="0 0 160 110"></svg>`;
  }
}

function svgForRod(id) {
  switch (id) {
    case 'single':
      return `<svg viewBox="0 0 160 60"><circle cx="10" cy="30" r="8" fill="#3b3a35"/><circle cx="150" cy="30" r="8" fill="#3b3a35"/><rect x="10" y="27" width="140" height="6" rx="3" fill="#3b3a35"/></svg>`;
    case 'double':
      return `<svg viewBox="0 0 160 60"><circle cx="10" cy="20" r="6" fill="#3b3a35"/><circle cx="150" cy="20" r="6" fill="#3b3a35"/><rect x="10" y="18" width="140" height="4" rx="2" fill="#3b3a35"/><circle cx="14" cy="40" r="6" fill="#7a6a3f"/><circle cx="146" cy="40" r="6" fill="#7a6a3f"/><rect x="14" y="38" width="132" height="4" rx="2" fill="#7a6a3f"/></svg>`;
    case 'track':
      return `<svg viewBox="0 0 160 60"><rect x="6" y="22" width="148" height="6" rx="2" fill="#9a9a92"/><g fill="#3b3a35"><circle cx="20" cy="34" r="3"/><circle cx="40" cy="34" r="3"/><circle cx="60" cy="34" r="3"/><circle cx="80" cy="34" r="3"/><circle cx="100" cy="34" r="3"/><circle cx="120" cy="34" r="3"/><circle cx="140" cy="34" r="3"/></g></svg>`;
    case 'wand':
      return `<svg viewBox="0 0 160 60"><rect x="6" y="22" width="148" height="6" rx="2" fill="#9a9a92"/><line x1="80" y1="28" x2="80" y2="52" stroke="#7a6a3f" stroke-width="2"/></svg>`;
    case 'tension':
      return `<svg viewBox="0 0 160 60"><rect x="4" y="26" width="152" height="4" rx="2" fill="#c0a060"/><rect x="0" y="22" width="6" height="12" fill="#3b3a35"/><rect x="154" y="22" width="6" height="12" fill="#3b3a35"/></svg>`;
    default: return `<svg viewBox="0 0 160 60"></svg>`;
  }
}

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function toUnit(valueInches) {
  if (valueInches == null || isNaN(valueInches)) return null;
  return state.unit === 'cm' ? valueInches * 2.54 : valueInches;
}
// inputs are entered in the chosen unit; we keep raw input but treat as inches for display label.
function unitLabel() { return state.unit === 'cm' ? 'cm' : '"'; }
function fmt(n, digits = 1) {
  if (n == null || isNaN(n)) return '—';
  return `${(+n).toFixed(digits)}${unitLabel()}`;
}

function getHeader() { return HEADER_STYLES.find(h => h.id === state.header) || null; }
function getRod()    { return RODS.find(r => r.id === state.rod) || null; }

function coverageWidth() {
  if (state.windowWidth == null) return null;
  const ext = +state.extension || 0;
  return +state.windowWidth + ext * 2;
}

function finishedHeight() {
  if (state.bottomStyle === 'sill') {
    return state.customLength != null ? +state.customLength : null;
  }
  if (state.rodToFloor == null) return null;
  return +state.rodToFloor + (+state.bottomStyle); // bottomStyle is offset in current unit
}

function totalFabricWidth() {
  const w = coverageWidth();
  if (w == null) return null;
  return w * (+state.fullness);
}

function widthPerPanel() {
  const tw = totalFabricWidth();
  if (tw == null || !state.panels) return null;
  return tw / +state.panels;
}

// ---------- Rendering ----------
function renderHeaderGrid() {
  const el = $('#headerGrid');
  el.innerHTML = HEADER_STYLES.map(h => `
    <button class="card ${state.header === h.id ? 'selected' : ''}" data-id="${h.id}" type="button">
      <div class="thumb thumb-img"><img src="${h.img}" alt="${h.name}" loading="lazy"/></div>
      <div class="body"><strong>${h.name}</strong><span>${h.desc}</span></div>
    </button>
  `).join('');
  el.querySelectorAll('.card').forEach(b => b.addEventListener('click', () => {
    state.header = b.dataset.id;
    const h = getHeader();
    if (h) state.fullness = h.rec; // pre-select recommended fullness
    renderHeaderGrid();
    renderRodGrid();
    renderLive();
    syncFullnessRadios();
  }));
}

function renderRodGrid() {
  const el = $('#rodGrid');
  const h = getHeader();
  const allowed = h ? new Set(h.supports) : null;
  const list = allowed ? RODS.filter(r => allowed.has(r.type)) : RODS;

  // If the previously chosen rod is no longer compatible, clear it.
  if (state.rod && !list.some(r => r.id === state.rod)) state.rod = null;

  el.innerHTML = list.map(r => `
    <button class="card ${state.rod === r.id ? 'selected' : ''}" data-id="${r.id}" type="button">
      <div class="thumb thumb-img"><img src="${r.img}" alt="${r.name}" loading="lazy"/></div>
      <div class="body"><strong>${r.name}</strong><span>${r.desc}</span></div>
    </button>
  `).join('');
  el.querySelectorAll('.card').forEach(b => b.addEventListener('click', () => {
    state.rod = b.dataset.id;
    renderRodGrid();
    renderLive();
  }));
}

function syncFullnessRadios() {
  $$('input[name="fullness"]').forEach(r => { r.checked = (+r.value === +state.fullness); });
}

function renderLive() {
  const u = unitLabel();
  const items = [
    ['Header style', getHeader()?.name],
    ['Rod / Hardware', getRod()?.name],
    ['Window width', state.windowWidth != null ? `${state.windowWidth}${u}` : null],
    ['Extension / side', state.extension != null ? `${state.extension}${u}` : null],
    ['Coverage width', fmt(coverageWidth())],
    ['Rod-to-floor', state.rodToFloor != null ? `${state.rodToFloor}${u}` : null],
    ['Finished length', fmt(finishedHeight())],
    ['Panels', state.panels],
    ['Fullness', `${state.fullness}×`],
    ['Total fabric width', fmt(totalFabricWidth())],
    ['Width per panel', fmt(widthPerPanel())],
  ];
  $('#live').innerHTML = items.map(([k, v]) => `
    <li><span class="k">${k}</span><span class="v ${v == null || v === '—' ? 'empty' : ''}">${v == null ? '—' : v}</span></li>
  `).join('');
}

function renderSummary() {
  const u = unitLabel();
  const h = getHeader();
  const r = getRod();
  const rows = [
    ['__section', 'Style'],
    ['Header style', h?.name || '—'],
    ['Rod / Hardware', r?.name || '—'],
    ['__section', 'Dimensions'],
    ['Window width', state.windowWidth != null ? `${state.windowWidth}${u}` : '—'],
    ['Extension per side', state.extension != null ? `${state.extension}${u}` : '—'],
    ['Coverage width', fmt(coverageWidth())],
    ['Rod-to-floor height', state.rodToFloor != null ? `${state.rodToFloor}${u}` : '—'],
    ['Bottom style', state.bottomStyle === 'sill' ? `Custom (${state.customLength ?? '—'}${u})` : describeBottom(state.bottomStyle)],
    ['Finished length', fmt(finishedHeight())],
    ['__section', 'Fabric'],
    ['Panel quantity', state.panels],
    ['Fullness', `${state.fullness}×`],
    ['Total fabric width', fmt(totalFabricWidth())],
    ['Width per panel', fmt(widthPerPanel())],
  ];
  const html = `<table>${rows.map(([k, v]) =>
    k === '__section'
      ? `<tr><td class="section" colspan="2">${v}</td></tr>`
      : `<tr><td>${k}</td><td>${v}</td></tr>`
  ).join('')}</table>`;
  $('#summary').innerHTML = html;
}

function describeBottom(v) {
  switch (String(v)) {
    case '0.5': return 'Floating (½" above floor)';
    case '0':   return 'Touching floor';
    case '-2':  return 'Break (2" puddle)';
    case '-6':  return 'Puddle (6")';
    default:    return v;
  }
}

// ---------- Step navigation ----------
function gotoStep(n) {
  state.step = Math.min(7, Math.max(1, n));
  $$('.panel').forEach(p => p.classList.toggle('active', +p.dataset.panel === state.step));
  $$('.step').forEach(s => {
    const i = +s.dataset.step;
    s.classList.toggle('active', i === state.step);
    s.classList.toggle('done', i < state.step);
  });
  $('#prevBtn').disabled = state.step === 1;
  $('#nextBtn').textContent = state.step === 7 ? 'Done' : 'Next →';
  if (state.step === 7) renderSummary();
}

function canAdvance() {
  switch (state.step) {
    case 1: return !!state.header;
    case 2: return !!state.rod;
    case 3: return state.windowWidth != null && state.windowWidth > 0;
    case 4:
      if (state.bottomStyle === 'sill') return state.customLength != null && state.customLength > 0;
      return state.rodToFloor != null && state.rodToFloor > 0;
    case 5: return !!state.panels;
    case 6: return !!state.fullness;
    default: return true;
  }
}

// ---------- Wiring ----------
document.addEventListener('DOMContentLoaded', () => {
  renderHeaderGrid();
  renderRodGrid();
  renderLive();

  $$('input[name="unit"]').forEach(r => r.addEventListener('change', e => {
    state.unit = e.target.value;
    renderLive();
    if (state.step === 3) updateCoverageWidthOut();
    if (state.step === 4) updateCoverageHeightOut();
    if (state.step === 7) renderSummary();
  }));

  $('#windowWidth').addEventListener('input', e => {
    state.windowWidth = e.target.value === '' ? null : +e.target.value;
    updateCoverageWidthOut(); renderLive();
  });
  $('#extension').addEventListener('input', e => {
    state.extension = e.target.value === '' ? 0 : +e.target.value;
    updateCoverageWidthOut(); renderLive();
  });

  $('#rodToFloor').addEventListener('input', e => {
    state.rodToFloor = e.target.value === '' ? null : +e.target.value;
    updateCoverageHeightOut(); renderLive();
  });
  $('#bottomStyle').addEventListener('change', e => {
    state.bottomStyle = e.target.value;
    $('#customLengthRow').style.display = e.target.value === 'sill' ? '' : 'none';
    updateCoverageHeightOut(); renderLive();
  });
  $('#customLength').addEventListener('input', e => {
    state.customLength = e.target.value === '' ? null : +e.target.value;
    updateCoverageHeightOut(); renderLive();
  });

  $$('input[name="panels"]').forEach(r => r.addEventListener('change', e => {
    state.panels = +e.target.value; renderLive();
  }));
  $$('input[name="fullness"]').forEach(r => r.addEventListener('change', e => {
    state.fullness = +e.target.value; renderLive();
  }));

  $('#prevBtn').addEventListener('click', () => gotoStep(state.step - 1));
  $('#nextBtn').addEventListener('click', () => {
    if (!canAdvance()) {
      flashStep();
      return;
    }
    if (state.step < 7) gotoStep(state.step + 1);
    else renderPreview();
  });
  $$('.step').forEach(s => s.addEventListener('click', () => gotoStep(+s.dataset.step)));

  $('#printBtn').addEventListener('click', () => window.print());
  $('#copyBtn').addEventListener('click', copySpec);
  $('#resetBtn').addEventListener('click', () => { if (confirm('Start over?')) location.reload(); });

  gotoStep(1);
});

function updateCoverageWidthOut() { $('#coverageWidthOut').textContent = fmt(coverageWidth()); }
function updateCoverageHeightOut() { $('#coverageHeightOut').textContent = fmt(finishedHeight()); }

function flashStep() {
  const active = document.querySelector('.panel.active');
  if (!active) return;
  active.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
    { duration: 240 }
  );
}

function copySpec() {
  const u = unitLabel();
  const h = getHeader(), r = getRod();
  const lines = [
    'CURTAIN ORDER SPECIFICATION',
    '===========================',
    `Header style       : ${h?.name || '-'}`,
    `Rod / Hardware     : ${r?.name || '-'}`,
    `Window width       : ${state.windowWidth ?? '-'}${u}`,
    `Extension / side   : ${state.extension ?? '-'}${u}`,
    `Coverage width     : ${fmt(coverageWidth())}`,
    `Rod-to-floor       : ${state.rodToFloor ?? '-'}${u}`,
    `Bottom style       : ${state.bottomStyle === 'sill' ? `Custom ${state.customLength ?? '-'}${u}` : describeBottom(state.bottomStyle)}`,
    `Finished length    : ${fmt(finishedHeight())}`,
    `Panels             : ${state.panels}`,
    `Fullness           : ${state.fullness}x`,
    `Total fabric width : ${fmt(totalFabricWidth())}`,
    `Width per panel    : ${fmt(widthPerPanel())}`,
    '',
    'Note: handmade tolerance ±1" is expected.',
  ].join('\n');
  navigator.clipboard.writeText(lines).then(
    () => { const b = $('#copyBtn'); const t = b.textContent; b.textContent = 'Copied!'; setTimeout(() => b.textContent = t, 1200); },
    () => alert('Copy failed — your browser blocked clipboard access.')
  );
}

// ---------- Final Preview ----------
function renderPreview() {
  const wrap = $('#previewWrap');
  const host = $('#preview');
  const caption = $('#previewCaption');
  host.innerHTML = buildPreviewSVG();
  caption.textContent = buildPreviewCaption();
  wrap.hidden = false;
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildPreviewCaption() {
  const h = getHeader(), r = getRod();
  const parts = [];
  if (h) parts.push(h.name);
  if (r) parts.push(r.name);
  parts.push(`${state.panels} panel${state.panels > 1 ? 's' : ''}`);
  parts.push(`${state.fullness}× fullness`);
  if (state.bottomStyle === 'sill') parts.push('sill length');
  else parts.push(describeBottom(state.bottomStyle).toLowerCase());
  return parts.join(' · ');
}

function buildPreviewSVG() {
  // Canvas
  const W = 760, H = 560;
  const headerId = state.header || 'flat_panel';
  const rodId = state.rod || 'single';
  const panels = +state.panels || 2;
  const fullness = +state.fullness || 2;

  const coverW = coverageWidth() ?? 60;
  const finH = finishedHeight() ?? 84;

  // Scene anchors
  const floorY = H - 60;             // top of floor
  const baseY  = floorY;             // baseboard line
  const ceilY  = 18;
  const wallW = W;
  const wallX = 0;

  // Window — sized relative to coverage
  const winRatio = state.windowWidth ? Math.max(0.3, state.windowWidth / coverW) : 0.7;
  const winW = (W - 100) * 0.62 * winRatio;
  const winH = Math.min(330, Math.max(180, (finH / Math.max(coverW, 1)) * winW * 1.2));
  const winX = (W - winW) / 2;
  const winY = 70;

  // Rod — extends beyond the window for stack-back
  const rodY = winY - 28;
  const rodLeft  = Math.max(40, winX - 70);
  const rodRight = Math.min(W - 40, winX + winW + 70);

  // Curtain top (just under rod)
  const curtainTop = rodY + 8;

  // Curtain bottom Y
  let curtainBottom;
  if (state.bottomStyle === 'sill') {
    curtainBottom = winY + winH + 6;
  } else {
    const offset = +state.bottomStyle;
    if (offset >= 0.5)      curtainBottom = floorY - 8;
    else if (offset === 0)  curtainBottom = floorY - 1;
    else if (offset === -2) curtainBottom = floorY + 8;
    else                    curtainBottom = floorY + 24;
  }

  const totalCurtainW = rodRight - rodLeft;
  const panelW = totalCurtainW / panels;

  // Number of pleats per panel scales with fullness
  const pleatsPerPanel = Math.max(6, Math.round(panelW / 14 * (fullness / 2)));

  // Build panels
  let panelsSVG = '';
  for (let i = 0; i < panels; i++) {
    const x0 = rodLeft + i * panelW;
    panelsSVG += drawPanel(x0, panelW, curtainTop, curtainBottom, pleatsPerPanel, headerId, fullness, i);
  }

  // Hardware
  const hardware = drawHardware(rodId, rodLeft, rodRight, rodY);

  // Tree silhouettes behind window (decorative)
  const treeBlobs = `
    <g opacity=".75">
      <ellipse cx="${winX + winW * 0.25}" cy="${winY + winH * 0.55}" rx="${winW * 0.22}" ry="${winH * 0.42}" fill="#9bbf86"/>
      <ellipse cx="${winX + winW * 0.55}" cy="${winY + winH * 0.40}" rx="${winW * 0.30}" ry="${winH * 0.48}" fill="#7fae6f"/>
      <ellipse cx="${winX + winW * 0.82}" cy="${winY + winH * 0.62}" rx="${winW * 0.20}" ry="${winH * 0.40}" fill="#9bbf86"/>
      <ellipse cx="${winX + winW * 0.40}" cy="${winY + winH * 0.78}" rx="${winW * 0.18}" ry="${winH * 0.22}" fill="#b6d29f"/>
    </g>
    <g stroke="#5a4a2c" stroke-width="2" opacity=".55" stroke-linecap="round">
      <line x1="${winX + winW * 0.30}" y1="${winY + winH}" x2="${winX + winW * 0.30}" y2="${winY + winH * 0.50}"/>
      <line x1="${winX + winW * 0.65}" y1="${winY + winH}" x2="${winX + winW * 0.65}" y2="${winY + winH * 0.40}"/>
    </g>
  `;

  // Window mullions: 3 columns × 4 rows (like sample)
  const cols = 3, rows = 4;
  let mullions = '';
  for (let c = 1; c < cols; c++) {
    const x = winX + (winW / cols) * c;
    mullions += `<line x1="${x}" y1="${winY}" x2="${x}" y2="${winY + winH}" stroke="#fff" stroke-width="4"/>`;
  }
  for (let r = 1; r < rows; r++) {
    const y = winY + (winH / rows) * r;
    mullions += `<line x1="${winX}" y1="${y}" x2="${winX + winW}" y2="${y}" stroke="#fff" stroke-width="4"/>`;
  }

  const defs = `
    <defs>
      <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0"  stop-color="#f6efe2"/>
        <stop offset="1"  stop-color="#ece2cf"/>
      </linearGradient>
      <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#d9c19a"/>
        <stop offset="1" stop-color="#b89968"/>
      </linearGradient>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e7f1e2"/>
        <stop offset="1" stop-color="#cfe1c4"/>
      </linearGradient>
      <linearGradient id="frameG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#e8e2d3"/>
      </linearGradient>
      <!-- linen fabric texture: subtle warm cream with vertical streaks -->
      <pattern id="linen" width="3" height="6" patternUnits="userSpaceOnUse">
        <rect width="3" height="6" fill="#efe5d0"/>
        <line x1="0" y1="0" x2="0" y2="6" stroke="#dcd0b3" stroke-width=".5" opacity=".5"/>
        <line x1="1.5" y1="0" x2="1.5" y2="6" stroke="#f7eed9" stroke-width=".4" opacity=".7"/>
      </pattern>
      <linearGradient id="rodG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a3a3a"/>
        <stop offset=".5" stop-color="#1a1a1a"/>
        <stop offset="1" stop-color="#2c2c2c"/>
      </linearGradient>
      <radialGradient id="finialG" cx=".35" cy=".35" r=".7">
        <stop offset="0" stop-color="#6a6a6a"/>
        <stop offset=".5" stop-color="#2a2a2a"/>
        <stop offset="1" stop-color="#0e0e0e"/>
      </radialGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <feOffset dx="0" dy="3" result="off"/>
        <feComponentTransfer><feFuncA type="linear" slope=".35"/></feComponentTransfer>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="blurBg" x="0" y="0">
        <feGaussianBlur stdDeviation="4"/>
      </filter>
    </defs>
  `;

  // Floor planks (faint vertical lines)
  let planks = '';
  const plankW = 80;
  for (let x = 0; x <= W; x += plankW) {
    planks += `<line x1="${x}" y1="${floorY}" x2="${x}" y2="${H}" stroke="#7a5d35" stroke-width=".8" opacity=".4"/>`;
  }

  const scene = `
    <!-- wall -->
    <rect x="0" y="0" width="${W}" height="${floorY}" fill="url(#wallG)"/>
    <!-- baseboard -->
    <rect x="0" y="${baseY - 8}" width="${W}" height="8" fill="#f5ecd9" stroke="#c9bb9c" stroke-width="1"/>
    <!-- floor -->
    <rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="url(#floorG)"/>
    ${planks}
    <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="#8d6c3a" stroke-width="1.5"/>

    <!-- window outer frame -->
    <rect x="${winX - 10}" y="${winY - 10}" width="${winW + 20}" height="${winH + 20}" fill="url(#frameG)" stroke="#cabd9d" stroke-width="1" rx="2"/>
    <!-- window glass background -->
    <rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" fill="url(#skyG)"/>
    <g filter="url(#blurBg)" clip-path="inset(0 round 0)">
      <rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" fill="url(#skyG)"/>
      ${treeBlobs}
    </g>
    <!-- mullions -->
    ${mullions}
    <!-- inner frame edge -->
    <rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" fill="none" stroke="#fff" stroke-width="3"/>
    <!-- sill -->
    <rect x="${winX - 14}" y="${winY + winH + 8}" width="${winW + 28}" height="6" fill="#f5ecd9" stroke="#c9bb9c"/>
  `;

  return `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Curtain preview">
      ${defs}
      ${scene}
      <g filter="url(#softShadow)">${panelsSVG}</g>
      ${hardware}
    </svg>
  `;
}

function drawHardware(rodId, x1, x2, y) {
  const rod = `<rect x="${x1 - 6}" y="${y - 3}" width="${x2 - x1 + 12}" height="6" rx="3" fill="url(#rodG)"/>`;
  // decorative finials (ball + cap) — like the sample image
  const finial = (cx) => `
    <rect x="${cx - 3}" y="${y - 4}" width="6" height="8" fill="#1a1a1a"/>
    <circle cx="${cx}" cy="${y}" r="9" fill="url(#finialG)"/>
    <circle cx="${cx - 2.5}" cy="${y - 2.5}" r="2.5" fill="#fff" opacity=".25"/>
  `;
  // wall brackets
  const bracket = (bx) => `
    <rect x="${bx - 3}" y="${y - 4}" width="6" height="22" rx="2" fill="#1a1a1a"/>
    <circle cx="${bx}" cy="${y + 20}" r="3.5" fill="#1a1a1a"/>
  `;

  switch (rodId) {
    case 'double':
      return `
        ${rod}
        ${finial(x1 - 12)} ${finial(x2 + 12)}
        ${bracket(x1 + 30)} ${bracket(x2 - 30)}
        <rect x="${x1 + 4}" y="${y + 22}" width="${x2 - x1 - 8}" height="4" rx="2" fill="#7a6a3f"/>
      `;
    case 'track':
    case 'wand':
      return `<rect x="${x1 - 4}" y="${y - 3}" width="${x2 - x1 + 8}" height="6" rx="2" fill="#bcbcb5" stroke="#6e6e66"/>`;
    case 'tension':
      return `
        <rect x="${x1}" y="${y - 2}" width="${x2 - x1}" height="5" rx="2.5" fill="#c0a060"/>
        <rect x="${x1 - 4}" y="${y - 6}" width="6" height="12" fill="#1a1a1a"/>
        <rect x="${x2 - 2}" y="${y - 6}" width="6" height="12" fill="#1a1a1a"/>
      `;
    case 'single':
    default:
      return `
        ${rod}
        ${finial(x1 - 12)} ${finial(x2 + 12)}
        ${bracket(x1 + 30)} ${bracket(x2 - 30)}
      `;
  }
}

function drawPanel(x0, w, top, bottom, pleats, headerId, fullness, panelIndex) {
  // Each panel is rendered as a stack of vertical "pleat" strips with light-to-dark
  // gradients, simulating the shadows between folds you see on real curtains.
  const segW = w / pleats;
  const h = bottom - top;

  // Soft hem at the bottom: small wave amplitude
  const hemAmp = 3 + fullness * 0.6;

  // Outline (used for clip + soft outer edge)
  let outline = `M ${x0} ${top} L ${x0 + w} ${top} L ${x0 + w} ${bottom - hemAmp} `;
  for (let i = pleats; i >= 1; i--) {
    const cx = x0 + (i - 0.5) * segW;
    const ex = x0 + (i - 1) * segW;
    outline += `Q ${cx} ${bottom + hemAmp} ${ex} ${bottom - hemAmp} `;
  }
  outline += 'Z';

  const clipId = `panelClip_${panelIndex}_${Math.round(x0)}`;

  // Pleat strips: each strip is a quad with a side-to-side gradient generated inline.
  // To avoid making N gradients per panel, we approximate using overlaid translucent
  // shadow + highlight rectangles — visually identical at this scale and far cheaper.
  let strips = '';
  for (let i = 0; i < pleats; i++) {
    const sx = x0 + i * segW;
    // dark shadow on right side of each pleat (where folds tuck under)
    strips += `<rect x="${sx + segW * 0.78}" y="${top}" width="${segW * 0.22}" height="${h}"
                     fill="#000" opacity="${0.10 + fullness * 0.04}"/>`;
    // soft highlight near left-of-center
    strips += `<rect x="${sx + segW * 0.18}" y="${top}" width="${segW * 0.30}" height="${h}"
                     fill="#fff" opacity="${0.18}"/>`;
    // crisp dark fold line
    strips += `<line x1="${sx}" y1="${top + 4}" x2="${sx}" y2="${bottom - 6}"
                     stroke="#a78f5e" stroke-width=".8" opacity=".55"/>`;
  }

  // Side shading (overall barrel effect)
  const sideShade = `
    <rect x="${x0}"          y="${top}" width="${w * 0.10}" height="${h}" fill="#000" opacity=".10"/>
    <rect x="${x0 + w * 0.90}" y="${top}" width="${w * 0.10}" height="${h}" fill="#000" opacity=".12"/>
  `;

  // Header decoration (drawn on top of fabric)
  let header = '';
  switch (headerId) {
    case 'grommet': {
      const n = Math.max(4, Math.round(w / 26));
      for (let i = 0; i < n; i++) {
        const cx = x0 + (i + 0.5) * (w / n);
        header += `
          <circle cx="${cx}" cy="${top - 1}" r="5" fill="#2a2a2a"/>
          <circle cx="${cx}" cy="${top - 1}" r="3" fill="#f0e6d0"/>
        `;
      }
      break;
    }
    case 'rod_pocket': {
      // gathered fabric bunched on the rod (like sample image)
      const n = Math.max(8, Math.round(w / 10));
      for (let i = 0; i < n; i++) {
        const cx = x0 + (i + 0.5) * (w / n);
        const tilt = (i % 2 === 0 ? 1 : -1) * 1.2;
        header += `<path d="M ${cx - 3 + tilt} ${top - 8} Q ${cx} ${top - 14} ${cx + 3 + tilt} ${top - 8} L ${cx + 2} ${top + 4} L ${cx - 2} ${top + 4} Z" fill="#e8dcbf" stroke="#b8a578" stroke-width=".5"/>`;
      }
      // shadow line under the pocket
      header += `<rect x="${x0}" y="${top + 2}" width="${w}" height="4" fill="#000" opacity=".18"/>`;
      break;
    }
    case 'pinch_dbl':
    case 'pinch_tri': {
      const n = Math.max(3, Math.round(w / 40));
      const flares = headerId === 'pinch_tri' ? 14 : 11;
      for (let i = 0; i < n; i++) {
        const cx = x0 + (i + 0.5) * (w / n);
        header += `<path d="M ${cx} ${top - 4} l -${flares / 2} ${flares + 4} h ${flares} z" fill="#c8b285" stroke="#7a6a3f" stroke-width=".6"/>`;
      }
      break;
    }
    case 'back_tab':
      header += `<rect x="${x0}" y="${top - 1}" width="${w}" height="3" fill="#000" opacity=".22"/>`;
      break;
    case 'tab_top': {
      const n = Math.max(3, Math.round(w / 38));
      for (let i = 0; i < n; i++) {
        const cx = x0 + (i + 0.5) * (w / n);
        header += `<rect x="${cx - 4}" y="${top - 18}" width="8" height="20" rx="3" fill="#c8b285" stroke="#7a6a3f" stroke-width=".5"/>`;
      }
      break;
    }
    case 'flat_panel':
      header += `<line x1="${x0}" y1="${top + 1}" x2="${x0 + w}" y2="${top + 1}" stroke="#a78f5e" stroke-width="1" opacity=".4"/>`;
      break;
    case 'ripple_fold': {
      const n = Math.max(4, Math.round(w / 22));
      for (let i = 0; i < n; i++) {
        const cx = x0 + (i + 0.5) * (w / n);
        header += `<circle cx="${cx}" cy="${top - 2}" r="2.6" fill="#1a1a1a"/>`;
      }
      break;
    }
    case 'pencil': {
      const n = Math.max(10, Math.round(w / 7));
      for (let i = 0; i < n; i++) {
        const cx = x0 + (i + 0.5) * (w / n);
        header += `<line x1="${cx}" y1="${top}" x2="${cx}" y2="${top + 12}" stroke="#7a6a3f" stroke-width="1"/>`;
      }
      break;
    }
  }

  return `
    <g class="curtain-panel">
      <defs>
        <clipPath id="${clipId}"><path d="${outline}"/></clipPath>
      </defs>
      <!-- fabric base -->
      <path d="${outline}" fill="url(#linen)"/>
      <!-- pleat shadows / highlights, clipped to panel shape -->
      <g clip-path="url(#${clipId})">
        ${strips}
        ${sideShade}
      </g>
      <!-- crisp outline -->
      <path d="${outline}" fill="none" stroke="#b8a578" stroke-width=".8" opacity=".7"/>
      ${header}
    </g>
  `;
}
