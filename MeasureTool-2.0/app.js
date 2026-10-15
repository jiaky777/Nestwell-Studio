'use strict';

const INCHES_PER_CENTIMETER = 1 / 2.54;

const HEADINGS = [
  {
    id: 'double-pleat',
    name: 'Double Pleat',
    image: 'assets/Double%20Pleat.jpg',
    description: 'Tailored pairs of folds for an elegant, structured drape.',
    fullness: [2],
  },
  {
    id: 'single-pleat',
    name: 'Single Pleat',
    image: 'assets/Single%20Pleat.jpg',
    description: 'A slim tailored fold with a lighter profile.',
    fullness: [2, 1.8, 1.5],
  },
  {
    id: 'four-claw-hook',
    name: 'Four-Claw Hook',
    image: 'assets/Four_Claw_Hook.jpg',
    description: 'Four-prong hooks form regular, traditional pleats.',
    fullness: [2, 1.8, 1.5],
  },
  {
    id: 'rod-pocket',
    name: 'Rod Pocket',
    image: 'assets/Rod%20Pocket.jpg',
    description: 'A soft gathered sleeve that threads onto the rod.',
    fullness: [2, 1.8, 1.5],
  },
  {
    id: 'grommet',
    name: 'Grommet Top',
    image: 'assets/Grommet.jpg',
    description: 'Clean metal-ring openings with a relaxed wave.',
    fullness: [2, 1.8, 1.5],
  },
  {
    id: 'back-tab',
    name: 'Back Tab',
    image: 'assets/Back_tab.jpg',
    description: 'Hidden loops create an unfussy, even rhythm.',
    fullness: [2, 1.8, 1.5],
  },
];

const FINISH_STYLES = [
  {
    id: 'above-floor',
    name: '1/2" Above Floor',
    nameCm: '1.27 cm Above Floor',
    offsetIn: -0.5,
    tag: 'Recommended',
    description: 'Lightly lifted. Keeps the hem clean and easy to vacuum beneath.',
  },
  {
    id: 'kiss-floor',
    name: 'Kiss Floor',
    nameCm: 'Kiss Floor',
    offsetIn: 0,
    tag: 'Tailored',
    description: 'Just touching. A clean, considered finish with an exact fit.',
  },
  {
    id: 'puddle',
    name: '2" Puddle',
    nameCm: '5.08 cm Puddle',
    offsetIn: 2,
    tag: 'Relaxed luxury',
    description: 'Softly pooled. A little extra fabric for an indulgent drape.',
  },
];

const state = {
  step: 1,
  highestStep: 1,
  unit: 'in',
  widthMethod: 'direct',
  rodWidthIn: null,
  windowWidthIn: null,
  extensionIn: 12,
  headingId: null,
  fullness: null,
  panels: 2,
  rodToFloorHeightIn: null,
  finishId: null,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function selectedHeading() {
  return HEADINGS.find((heading) => heading.id === state.headingId) || null;
}

function selectedFinish() {
  return FINISH_STYLES.find((finish) => finish.id === state.finishId) || null;
}

function finishName(finish = selectedFinish()) {
  if (!finish) return '—';
  return state.unit === 'cm' ? finish.nameCm : finish.name;
}

function formatAdjustment(inches) {
  const value = displayValue(inches);
  return `${value >= 0 ? '+' : ''}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${state.unit}`;
}

function displayValue(inches) {
  if (inches == null || !Number.isFinite(inches)) return null;
  return state.unit === 'cm' ? inches * 2.54 : inches;
}

function inputToInches(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return state.unit === 'cm' ? number * INCHES_PER_CENTIMETER : number;
}

function formatDimension(inches) {
  const value = displayValue(inches);
  if (value == null) return '—';
  const rounded = Math.round(value * 10) / 10;
  return `${rounded.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${state.unit}`;
}

function formatInput(inches) {
  const value = displayValue(inches);
  return value == null ? '' : String(Math.round(value * 100) / 100);
}

function curtainWidth() {
  if (state.widthMethod === 'direct') return state.rodWidthIn;
  return state.windowWidthIn == null ? null : state.windowWidthIn + state.extensionIn;
}

function fabricWidth() {
  const width = curtainWidth();
  return width == null || state.fullness == null ? null : width * state.fullness;
}

function panelWidth() {
  const total = fabricWidth();
  return total == null ? null : total / state.panels;
}

function lengthAllowance() {
  return state.headingId === 'grommet' ? 2 : 0;
}

function finishedCurtainLength() {
  const finish = selectedFinish();
  if (state.rodToFloorHeightIn == null || !finish) return null;
  const length = state.rodToFloorHeightIn + finish.offsetIn + lengthAllowance();
  return Number.isFinite(length) && length > 0 ? length : null;
}

function renderHeadingOptions() {
  $('#headingOptions').innerHTML = HEADINGS.map((heading) => `
    <label class="heading-card">
      <input type="radio" name="heading" value="${heading.id}" ${state.headingId === heading.id ? 'checked' : ''}>
      <span class="heading-art"><img src="${heading.image}" alt="${heading.name} curtain heading" loading="lazy"></span>
      <span class="choice-copy"><strong>${heading.name}</strong><small>${heading.description}</small></span>
    </label>
  `).join('');
}

function renderFullnessOptions() {
  const heading = selectedHeading();
  if (!heading) {
    $('#fullnessGuidance').textContent = 'Choose a heading style first.';
    $('#fullnessOptions').innerHTML = '';
    return;
  }

  const fixed = heading.fullness.length === 1;
  if (fixed) state.fullness = heading.fullness[0];
  if (!heading.fullness.includes(state.fullness)) state.fullness = null;

  $('#fullnessGuidance').innerHTML = fixed
    ? `<strong>${heading.name}</strong> uses a fixed <strong>2× fullness</strong> for properly formed pleats.`
    : `<strong>${heading.name}</strong> supports a recommended 2×, best-value 1.8×, or minimum 1.5× drape.`;

  const descriptions = { 1.5: 'Minimum required', 1.8: 'Best value', 2: fixed ? 'Required' : 'Recommended' };
  const images = { 1.5: 'assets/fullness_1_5.jpg', 1.8: 'assets/fullness_1_8.jpg', 2: 'assets/fullness_2_0.jpg' };
  $('#fullnessOptions').innerHTML = heading.fullness.map((value) => `
    <label class="choice-card fullness-choice">
      <input type="radio" name="fullness" value="${value}" ${state.fullness === value ? 'checked' : ''} ${fixed ? 'disabled' : ''}>
      <span class="fullness-art"><img src="${images[value]}" alt="Curtain shown at ${value.toFixed(1)} times fullness"></span>
      <span class="choice-copy"><small>${descriptions[value]}</small></span>
    </label>
  `).join('');
}

function roomIllustration(finish = null) {
  const id = `room-${finish?.id || 'height'}`;
  const puddle = finish?.id === 'puddle';
  const hem = finish?.id === 'above-floor' ? 290 : 300;
  const curtain = puddle
    ? 'M86 44 H157 L158 281 Q158 300 170 310 Q161 316 149 312 Q140 320 128 313 Q119 320 107 314 Q95 318 79 311 Q86 298 86 279 Z'
    : `M86 44 H157 L160 ${hem - 3} Q151 ${hem + 3} 141 ${hem - 1} Q131 ${hem + 3} 121 ${hem - 1} Q111 ${hem + 3} 101 ${hem - 1} Q91 ${hem + 3} 83 ${hem - 2} Z`;
  const panel = `
    <path d="${curtain}" fill="url(#${id}-folds)" stroke="#b7a68b" stroke-width=".7"/>
    <g clip-path="url(#${id}-panel)">
      <rect x="75" y="44" width="100" height="278" fill="url(#${id}-weave)" opacity=".3"/>
      ${[90, 108, 126, 144].map((x) => `
        <path d="M${x} 47 Q${x + 3} 143 ${x} 260 Q${x - 2} 294 ${x - (puddle ? 5 : 0)} ${puddle ? 314 : hem}" fill="none" stroke="#fbf5e8" stroke-width="1.4" opacity=".65"/>
      `).join('')}
      <path d="M80 53 H162 M80 57 H162" stroke="#af9b7b" stroke-width=".7" opacity=".65"/>
    </g>
    ${[91, 111, 132, 152].map((x) => `<path d="M${x} 38 V46" stroke="#82745e" stroke-width="2.3" stroke-linecap="round"/>`).join('')}
  `;
  return `
    <svg class="room-illustration" viewBox="${finish ? '64 20 272 312' : '0 0 400 350'}" xmlns="http://www.w3.org/2000/svg" ${finish ? 'aria-hidden="true"' : 'role="img" aria-label="Measure vertically from the top of the curtain rod to the floor, as shown by the arrow."'} focusable="false">
      <defs>
        <linearGradient id="${id}-wall" x2="1" y2=".8">
          <stop stop-color="#d6cebd"/><stop offset="1" stop-color="#f1ebde"/>
        </linearGradient>
        <linearGradient id="${id}-glass" x2=".3" y2="1">
          <stop stop-color="#eff1e5"/><stop offset="1" stop-color="#cbd0b4"/>
        </linearGradient>
        <linearGradient id="${id}-folds" gradientUnits="userSpaceOnUse" x1="85" x2="103" spreadMethod="repeat">
          <stop stop-color="#ab9878"/><stop offset=".24" stop-color="#cdbc9e"/>
          <stop offset=".55" stop-color="#f2e5cd"/><stop offset=".75" stop-color="#e6d7bc"/><stop offset="1" stop-color="#ab9878"/>
        </linearGradient>
        <pattern id="${id}-weave" width="3" height="3" patternUnits="userSpaceOnUse">
          <path d="M0 0 H3 M0 0 V3" stroke="#8c795d" stroke-width=".3"/>
        </pattern>
        <clipPath id="${id}-panel"><path d="${curtain}"/></clipPath>
        <clipPath id="${id}-window"><rect x="123" y="100" width="154" height="143"/></clipPath>
      </defs>
      <rect width="400" height="350" fill="url(#${id}-wall)"/>
      <path d="M0 302 H400 V350 H0Z" fill="#d4bd99"/>
      <path d="M0 304 H400 M0 330 H400 M42 302 L12 350 M104 302 L86 350 M168 302 L162 350 M232 302 L238 350 M296 302 L314 350 M358 302 L388 350" fill="none" stroke="#bba17b" stroke-width=".8" opacity=".6"/>
      <rect y="292" width="400" height="9" fill="#e6dcc8"/>
      <path d="M0 293 H400 M0 301 H400" stroke="#c6b99e" stroke-width="1"/>
      <rect x="113" y="90" width="174" height="164" fill="#c4bba8" opacity=".4"/>
      <rect x="116" y="92" width="168" height="158" fill="#faf7ee"/>
      <rect x="123" y="100" width="154" height="143" fill="url(#${id}-glass)"/>
      <g clip-path="url(#${id}-window)" opacity=".5">
        <path d="M256 260 Q224 171 252 97 M245 177 L202 126 M242 195 L276 155" fill="none" stroke="#a6ad91" stroke-width="4"/>
        <ellipse cx="144" cy="156" rx="47" ry="30" fill="#b1bd96"/>
        <ellipse cx="226" cy="118" rx="35" ry="40" fill="#bdc7a4"/>
        <ellipse cx="263" cy="196" rx="39" ry="33" fill="#a6b48c"/>
        <ellipse cx="155" cy="223" rx="55" ry="24" fill="#c8cfad"/>
      </g>
      <path d="M200 99 V244 M122 171 H278" stroke="#faf7ee" stroke-width="5"/>
      <rect x="111" y="249" width="178" height="5" rx="1" fill="#faf7ee"/>
      <path d="M77 38 H323" stroke="#50483a" stroke-width="4" stroke-linecap="round"/>
      <circle cx="72" cy="38" r="4.5" fill="#50483a"/><circle cx="328" cy="38" r="4.5" fill="#50483a"/>
      <path d="M86 39 V50 M314 39 V50" stroke="#75664e" stroke-width="2"/>
      ${finish ? `
        <ellipse cx="123" cy="${puddle ? 314 : 302}" rx="${puddle ? 48 : 40}" ry="3" fill="#887455" opacity=".15"/>
        <ellipse cx="277" cy="${puddle ? 314 : 302}" rx="${puddle ? 48 : 40}" ry="3" fill="#887455" opacity=".15"/>
        ${panel}<g transform="translate(400 0) scale(-1 1)">${panel}</g>
      ` : `
        <path d="M35 36 H57 M35 301 H57 M46 39 V298" fill="none" stroke="#7a5230" stroke-width="1.6"/>
        <path d="M46 37 L42 45 H50Z M46 300 L42 292 H50Z" fill="#7a5230"/>
        <text x="30" y="171" transform="rotate(-90 30 171)" text-anchor="middle" fill="#7a5230" font-family="Georgia, serif" font-size="11" letter-spacing="1.5">ROD TOP TO FLOOR</text>
      `}
    </svg>
  `;
}

function renderFinishOptions() {
  $('#heightIllustration').innerHTML = roomIllustration();
  $('#finishOptions').innerHTML = FINISH_STYLES.map((finish) => `
    <label class="choice-card finish-card">
      <input type="radio" name="finishStyle" value="${finish.id}" ${state.finishId === finish.id ? 'checked' : ''}>
      <span class="finish-art">${roomIllustration(finish)}</span>
      <span class="choice-copy">
        <span class="finish-tag">${finish.tag}</span>
        <strong data-finish-name="${finish.id}">${finishName(finish)}</strong>
        <small>${finish.description}</small>
        <span class="finish-offset" data-finish-offset="${finish.id}">${formatAdjustment(finish.offsetIn)} from floor length</span>
      </span>
    </label>
  `).join('');
}

function renderWidthFields() {
  const direct = state.widthMethod === 'direct';
  $('#directWidthFields').hidden = !direct;
  $('#windowWidthFields').hidden = direct;
  $$('input[name="widthMethod"]').forEach((input) => { input.checked = input.value === state.widthMethod; });
  $$('input[name="extension"]').forEach((input) => { input.checked = Number(input.value) === state.extensionIn; });
}

function renderUnitValues() {
  $$('[data-unit-label]').forEach((label) => { label.textContent = state.unit; });
  $('#rodWidth').value = formatInput(state.rodWidthIn);
  $('#windowWidth').value = formatInput(state.windowWidthIn);
  $('#rodToFloorHeight').value = formatInput(state.rodToFloorHeightIn);
  FINISH_STYLES.forEach((finish) => {
    $(`[data-finish-name="${finish.id}"]`).textContent = finishName(finish);
    $(`[data-finish-offset="${finish.id}"]`).textContent = `${formatAdjustment(finish.offsetIn)} from floor length`;
  });
  $$('[data-extension]').forEach((label) => {
    label.textContent = `+${formatDimension(Number(label.dataset.extension))}`;
  });
}

function renderCalculations() {
  const width = curtainWidth();
  $('#curtainWidthResult').textContent = width == null ? 'Not measured' : formatDimension(width);
  $('#formulaRodWidth').textContent = formatDimension(width);
  $('#formulaFullness').textContent = state.fullness == null ? '—' : `${state.fullness.toFixed(1)}×`;
  $('#fabricWidthResult').textContent = formatDimension(fabricWidth());
  $('#panelTotalResult').textContent = formatDimension(fabricWidth());
  $('#panelWidthResult').textContent = formatDimension(panelWidth());
  renderLengthCalculation();
}

function renderLengthCalculation() {
  const allowance = lengthAllowance();
  const adjustment = $('#grommetLengthAdjustment');
  adjustment.hidden = allowance === 0;
  if (allowance > 0) {
    const allowanceLabel = state.unit === 'cm' ? '5.08 cm' : '2 in';
    $('#grommetLengthCopy').textContent = `For Grommet Top curtains, ${allowanceLabel} is added above the rod. Your chosen floor finish is applied separately.`;
  }
  $('#finishedLengthResult').textContent = formatDimension(finishedCurtainLength());
  const finish = selectedFinish();
  $('#lengthBreakdown').textContent = finishedCurtainLength() == null
    ? 'Enter your rod-to-floor height and choose a finish to see the final length.'
    : `${formatDimension(state.rodToFloorHeightIn)} rod-to-floor ${formatAdjustment(finish.offsetIn)} finish${allowance > 0 ? ` ${formatAdjustment(allowance)} heading` : ''} = ${formatDimension(finishedCurtainLength())}`;
}

function renderLiveSummary() {
  const heading = selectedHeading();
  const items = [
    ['Rod / track width', formatDimension(curtainWidth())],
    ['Heading style', heading?.name || '—'],
    ['Rod top to floor', formatDimension(state.rodToFloorHeightIn)],
    ['Finish style', finishName()],
    ['Fullness', state.fullness == null ? '—' : `${state.fullness.toFixed(1)}×`],
    ['Total fabric width', formatDimension(fabricWidth())],
    ['Panels', String(state.panels)],
    ['Width per panel', formatDimension(panelWidth())],
    ['Final length', formatDimension(finishedCurtainLength())],
  ];
  $('#liveSummary').innerHTML = items.map(([label, value]) => `
    <div><dt>${label}</dt><dd class="${value === '—' ? 'is-empty' : ''}">${value}</dd></div>
  `).join('');
  $('#summaryTriggerValue').textContent = formatDimension(panelWidth());
}

const mobileSummaryQuery = window.matchMedia('(max-width: 900px)');

function setSummaryOpen(open) {
  const isMobile = mobileSummaryQuery.matches;
  const shouldOpen = isMobile && open;
  document.body.classList.toggle('summary-is-open', shouldOpen);
  $('#summaryTrigger').setAttribute('aria-expanded', String(shouldOpen));
  $('#summaryPopup').setAttribute('aria-hidden', String(isMobile && !shouldOpen));
  if (shouldOpen) $('#summaryClose').focus();
}

function syncSummaryMode() {
  setSummaryOpen(false);
  if (!mobileSummaryQuery.matches) $('#summaryPopup').removeAttribute('aria-hidden');
}

function renderReview() {
  const heading = selectedHeading();
  const source = state.widthMethod === 'direct'
    ? 'Measured rod or track'
    : `Window width + ${formatDimension(state.extensionIn)}`;
  const items = [
    ['Width source', source],
    ['Rod or track width', formatDimension(curtainWidth())],
    ['Heading style', heading?.name || '—'],
    ['Fullness', `${state.fullness.toFixed(1)}×`],
    ['Total fabric width', formatDimension(fabricWidth())],
    ['Number of panels', `${state.panels} panel${state.panels === 1 ? '' : 's'}`],
    ['Width per panel', formatDimension(panelWidth())],
    ['Rod top to floor', formatDimension(state.rodToFloorHeightIn)],
    ['Finish style', finishName()],
    ['Finish adjustment', formatAdjustment(selectedFinish().offsetIn)],
    ...(lengthAllowance() > 0 ? [['Grommet adjustment', `+${formatDimension(lengthAllowance())}`]] : []),
    ['Final curtain length', formatDimension(finishedCurtainLength())],
  ];
  $('#reviewList').innerHTML = items.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
}

function renderStep() {
  $$('.step-panel').forEach((panel) => {
    const active = Number(panel.dataset.step) === state.step;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
  $$('.progress-step').forEach((button) => {
    const step = Number(button.dataset.goStep);
    button.classList.toggle('is-active', step === state.step);
    button.classList.toggle('is-complete', step < state.step || step < state.highestStep);
    button.disabled = step > state.highestStep;
    if (step === state.step) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  $('#formNavigation').hidden = state.step === 6;
  $('#backButton').disabled = state.step === 1;
  $('#nextButton').textContent = state.step === 5 ? 'Review measurements' : 'Continue';

  if (state.step === 4) renderFullnessOptions();
  if (state.step === 6) renderReview();
  $('.step-panel.is-active h2')?.focus({ preventScroll: true });
}

function renderAll() {
  renderWidthFields();
  renderUnitValues();
  renderCalculations();
  renderLiveSummary();
}

function clearErrors() {
  $$('.field-error').forEach((error) => { error.textContent = ''; });
}

function validateStep(step = state.step) {
  clearErrors();
  if (step === 1 && !state.headingId) {
    $('#step1Error').textContent = 'Choose a heading style to continue.';
    return false;
  }
  if (step === 2 && curtainWidth() == null) {
    $('#step2Error').textContent = state.widthMethod === 'direct'
      ? 'Enter the installed rod or track length.'
      : 'Enter the window width to calculate the recommended rod length.';
    return false;
  }
  if (step === 3) {
    if (state.rodToFloorHeightIn == null) {
      $('#heightError').textContent = 'Enter the height from the top of the rod to the floor.';
      return false;
    }
    if (!selectedFinish()) {
      $('#finishStyleError').textContent = 'Choose a finish style to continue.';
      return false;
    }
    if (finishedCurtainLength() == null) {
      $('#heightError').textContent = 'The height is too short for this finish. The final curtain length must be greater than zero.';
      return false;
    }
  }
  if (step === 4 && state.fullness == null) {
    $('#step4Error').textContent = 'Choose a fullness ratio to continue.';
    return false;
  }
  return true;
}

function goToStep(step) {
  let target = Math.max(1, Math.min(6, step));
  if (target > state.step) {
    for (let prerequisite = 1; prerequisite < target; prerequisite += 1) {
      if (!validateStep(prerequisite)) {
        target = prerequisite;
        break;
      }
    }
  }
  state.step = target;
  state.highestStep = Math.max(state.highestStep, Math.min(state.step, 5));
  renderStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function specificationText() {
  const heading = selectedHeading();
  return [
    'NESTWELL STUDIO CURTAIN SPECIFICATION',
    `Rod or track width: ${formatDimension(curtainWidth())}`,
    `Heading style: ${heading?.name ?? '-'}`,
    `Fullness: ${state.fullness == null ? '-' : `${state.fullness.toFixed(1)}x`}`,
    `Total fabric width: ${formatDimension(fabricWidth())}`,
    `Panels: ${state.panels}`,
    `Width per panel: ${formatDimension(panelWidth())}`,
    `Rod top to floor: ${formatDimension(state.rodToFloorHeightIn)}`,
    `Finish style: ${finishName()}`,
    `Finish adjustment: ${selectedFinish() ? formatAdjustment(selectedFinish().offsetIn) : '-'}`,
    ...(lengthAllowance() > 0 ? [`Grommet adjustment: +${formatDimension(lengthAllowance())}`] : []),
    `Final curtain length: ${formatDimension(finishedCurtainLength())}`,
    'Note: Confirm all measurements before ordering.',
  ].join('\n');
}

function appendXmlElement(documentNode, parent, name, value) {
  const element = documentNode.createElement(name);
  element.textContent = String(value);
  parent.append(element);
  return element;
}

function appendXmlDimension(documentNode, parent, name, inches) {
  const value = displayValue(inches);
  const element = appendXmlElement(documentNode, parent, name, value == null ? '' : Number(value.toFixed(2)));
  element.setAttribute('unit', state.unit);
  return element;
}

function specificationXml() {
  const heading = selectedHeading();
  const xmlDocument = document.implementation.createDocument('', 'curtainSpecification');
  const root = xmlDocument.documentElement;
  root.setAttribute('version', '2.0');
  root.setAttribute('generatedAt', new Date().toISOString());

  appendXmlElement(xmlDocument, root, 'displayUnit', state.unit);

  const width = xmlDocument.createElement('width');
  root.append(width);
  appendXmlElement(xmlDocument, width, 'measurementMethod', state.widthMethod === 'direct' ? 'measured-rod-or-track' : 'window-estimate');
  if (state.widthMethod === 'window') {
    appendXmlDimension(xmlDocument, width, 'windowWidth', state.windowWidthIn);
    appendXmlDimension(xmlDocument, width, 'totalExtension', state.extensionIn);
  }
  appendXmlDimension(xmlDocument, width, 'rodOrTrackWidth', curtainWidth());

  const style = xmlDocument.createElement('style');
  root.append(style);
  const headingElement = appendXmlElement(xmlDocument, style, 'headingStyle', heading?.name ?? '');
  if (heading) headingElement.setAttribute('id', heading.id);
  appendXmlElement(xmlDocument, style, 'fullnessRatio', state.fullness ?? '');

  const fabric = xmlDocument.createElement('fabric');
  root.append(fabric);
  appendXmlDimension(xmlDocument, fabric, 'totalFabricWidth', fabricWidth());
  appendXmlElement(xmlDocument, fabric, 'panelCount', state.panels);
  appendXmlDimension(xmlDocument, fabric, 'widthPerPanel', panelWidth());

  const length = xmlDocument.createElement('length');
  root.append(length);
  appendXmlElement(xmlDocument, length, 'measurementMethod', 'rod-top-to-floor');
  appendXmlDimension(xmlDocument, length, 'rodToFloorHeight', state.rodToFloorHeightIn);
  const finish = selectedFinish();
  const finishElement = appendXmlElement(xmlDocument, length, 'finishStyle', finishName());
  if (finish) finishElement.setAttribute('id', finish.id);
  appendXmlDimension(xmlDocument, length, 'finishAdjustment', finish?.offsetIn ?? null);
  appendXmlDimension(xmlDocument, length, 'headingAdjustment', lengthAllowance());
  appendXmlDimension(xmlDocument, length, 'finalCurtainLength', finishedCurtainLength());

  appendXmlElement(xmlDocument, root, 'note', 'Confirm all measurements before ordering.');
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(xmlDocument)}`;
}

function defaultFileName() {
  return `nestwell-curtain-specification-${new Date().toISOString().slice(0, 10)}`;
}

// Strips characters that operating systems reject in file names.
function sanitizeFileName(name) {
  return name
    .replace(/\.xml$/i, '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.]+|[\s.]+$/g, '')
    .slice(0, 80);
}

function saveSpecificationXml(fileName) {
  const blob = new Blob([specificationXml()], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xml`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  $('#copyStatus').textContent = `Saved as ${fileName}.xml`;
}

function openSaveDialog() {
  const dialog = $('#saveDialog');
  const input = $('#saveFileName');
  $('#saveDialogError').textContent = '';
  input.value = defaultFileName();

  if (typeof dialog.showModal !== 'function') {
    saveSpecificationXml(defaultFileName());
    return;
  }

  dialog.showModal();
  input.focus();
  input.select();
}

function confirmSaveDialog(event) {
  event.preventDefault();
  const name = sanitizeFileName($('#saveFileName').value);
  if (!name) {
    $('#saveDialogError').textContent = 'Enter a file name to save this specification.';
    $('#saveFileName').focus();
    return;
  }
  $('#saveDialog').close();
  saveSpecificationXml(name);
}

async function copySpecification() {
  const status = $('#copyStatus');
  try {
    await navigator.clipboard.writeText(specificationText());
    status.textContent = 'Specification copied.';
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = specificationText();
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    status.textContent = copied ? 'Specification copied.' : 'Copy failed. Please select and copy the measurements manually.';
  }
}

function resetTool() {
  Object.assign(state, {
    step: 1,
    highestStep: 1,
    unit: 'in',
    widthMethod: 'direct',
    rodWidthIn: null,
    windowWidthIn: null,
    extensionIn: 12,
    headingId: null,
    fullness: null,
    panels: 2,
    rodToFloorHeightIn: null,
    finishId: null,
  });
  $('#measurementForm').reset();
  $('input[name="unit"][value="in"]').checked = true;
  $('input[name="widthMethod"][value="direct"]').checked = true;
  $('input[name="extension"][value="12"]').checked = true;
  $('input[name="panels"][value="2"]').checked = true;
  $('#copyStatus').textContent = '';
  clearErrors();
  renderHeadingOptions();
  renderFinishOptions();
  renderFullnessOptions();
  renderAll();
  goToStep(1);
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeadingOptions();
  renderFinishOptions();
  renderFullnessOptions();
  renderAll();
  renderStep();

  $$('input[name="unit"]').forEach((input) => input.addEventListener('change', (event) => {
    state.unit = event.target.value;
    renderAll();
    if (state.step === 6) renderReview();
  }));

  $$('input[name="widthMethod"]').forEach((input) => input.addEventListener('change', (event) => {
    state.widthMethod = event.target.value;
    clearErrors();
    renderAll();
  }));

  $('#rodWidth').addEventListener('input', (event) => {
    state.rodWidthIn = inputToInches(event.target.value);
    clearErrors();
    renderCalculations();
    renderLiveSummary();
  });

  $('#windowWidth').addEventListener('input', (event) => {
    state.windowWidthIn = inputToInches(event.target.value);
    clearErrors();
    renderCalculations();
    renderLiveSummary();
  });

  $$('input[name="extension"]').forEach((input) => input.addEventListener('change', (event) => {
    state.extensionIn = Number(event.target.value);
    renderCalculations();
    renderLiveSummary();
  }));

  $('#headingOptions').addEventListener('change', (event) => {
    if (event.target.name !== 'heading') return;
    state.headingId = event.target.value;
    const heading = selectedHeading();
    state.fullness = heading.fullness[0];
    clearErrors();
    renderFullnessOptions();
    renderCalculations();
    renderLiveSummary();
  });

  $('#fullnessOptions').addEventListener('change', (event) => {
    if (event.target.name !== 'fullness') return;
    state.fullness = Number(event.target.value);
    clearErrors();
    renderCalculations();
    renderLiveSummary();
  });

  $$('input[name="panels"]').forEach((input) => input.addEventListener('change', (event) => {
    state.panels = Number(event.target.value);
    renderCalculations();
    renderLiveSummary();
  }));

  $('#rodToFloorHeight').addEventListener('input', (event) => {
    state.rodToFloorHeightIn = inputToInches(event.target.value);
    clearErrors();
    renderLengthCalculation();
    renderLiveSummary();
  });

  $('#finishOptions').addEventListener('change', (event) => {
    if (event.target.name !== 'finishStyle') return;
    state.finishId = event.target.value;
    clearErrors();
    renderLengthCalculation();
    renderLiveSummary();
  });

  $('#nextButton').addEventListener('click', () => {
    goToStep(state.step + 1);
  });
  $('#backButton').addEventListener('click', () => goToStep(state.step - 1));
  $$('.progress-step').forEach((button) => button.addEventListener('click', () => goToStep(Number(button.dataset.goStep))));
  $('#editButton').addEventListener('click', () => goToStep(1));
  $('#copyButton').addEventListener('click', copySpecification);
  $('#saveXmlButton').addEventListener('click', openSaveDialog);
  $('#saveDialogForm').addEventListener('submit', confirmSaveDialog);
  $('#saveDialogCancel').addEventListener('click', () => $('#saveDialog').close());
  $('#printButton').addEventListener('click', () => window.print());
  $('#resetButton').addEventListener('click', resetTool);
  $('#summaryTrigger').addEventListener('click', () => setSummaryOpen(true));
  $('#summaryClose').addEventListener('click', () => {
    setSummaryOpen(false);
    $('#summaryTrigger').focus();
  });
  $('#summaryBackdrop').addEventListener('click', () => setSummaryOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('summary-is-open')) {
      setSummaryOpen(false);
      $('#summaryTrigger').focus();
    }
  });
  mobileSummaryQuery.addEventListener('change', syncSummaryMode);
  syncSummaryMode();
});