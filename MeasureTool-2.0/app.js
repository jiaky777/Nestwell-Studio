'use strict';

const INCHES_PER_CENTIMETER = 1 / 2.54;

const HEADINGS = [
  {
    id: 'double-pleat',
    name: 'Double Pleat',
    image: 'assets/Double%20Pleat.jpg',
    lengthImage: 'assets/measure_length_1.jpg',
    description: 'Tailored pairs of folds for an elegant, structured drape.',
    fullness: [2],
    guideTitle: 'Measure from the bottom of the curtain ring',
    guideCopy: 'Start at the bottom of the curtain ring and measure straight down to where you want the curtain to end.',
  },
  {
    id: 'single-pleat',
    name: 'Single Pleat',
    image: 'assets/Single%20Pleat.jpg',
    lengthImage: 'assets/measure_length_1.jpg',
    description: 'A slim tailored fold with a lighter profile.',
    fullness: [2, 1.8, 1.5],
    guideTitle: 'Measure from the bottom of the curtain ring',
    guideCopy: 'Start at the bottom of the curtain ring and measure straight down to where you want the curtain to end.',
  },
  {
    id: 'four-claw-hook',
    name: 'Four-Claw Hook',
    image: 'assets/Four_Claw_Hook.jpg',
    lengthImage: 'assets/measure_length_1.jpg',
    description: 'Four-prong hooks form regular, traditional pleats.',
    fullness: [2, 1.8, 1.5],
    guideTitle: 'Measure from the bottom of the curtain ring',
    guideCopy: 'Start at the bottom of the curtain ring and measure straight down to where you want the curtain to end.',
  },
  {
    id: 'rod-pocket',
    name: 'Rod Pocket',
    image: 'assets/Rod%20Pocket.jpg',
    lengthImage: 'assets/measure_length_2.jpg',
    description: 'A soft gathered sleeve that threads onto the rod.',
    fullness: [2, 1.8, 1.5],
    guideTitle: 'Measure from the top of the rod',
    guideCopy: 'Measure from the top of the rod straight down to where you want the curtain to end.',
  },
  {
    id: 'grommet',
    name: 'Grommet Top',
    image: 'assets/Grommet.jpg',
    lengthImage: 'assets/measure_length_2.jpg',
    description: 'Clean metal-ring openings with a relaxed wave.',
    fullness: [2, 1.8, 1.5],
    guideTitle: 'Measure from the top of the rod',
    guideCopy: 'Measure from the top of the rod straight down to where you want the curtain to end.',
  },
  {
    id: 'back-tab',
    name: 'Back Tab',
    image: 'assets/Back_tab.jpg',
    lengthImage: 'assets/measure_length_2.jpg',
    description: 'Hidden loops create an unfussy, even rhythm.',
    fullness: [2, 1.8, 1.5],
    guideTitle: 'Measure from the top of the rod',
    guideCopy: 'Measure from the top of the rod straight down to where you want the curtain to end.',
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
  curtainLengthIn: null,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function selectedHeading() {
  return HEADINGS.find((heading) => heading.id === state.headingId) || null;
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
  return state.curtainLengthIn == null ? null : state.curtainLengthIn + lengthAllowance();
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

function renderLengthGuide() {
  const heading = selectedHeading();
  if (!heading) return;
  $('#lengthHeadingName').textContent = heading.name;
  $('#lengthGuideTitle').textContent = heading.guideTitle;
  $('#lengthGuideCopy').textContent = heading.guideCopy;
  $('#lengthIllustration').innerHTML = `
    <img src="${heading.lengthImage}" alt="How to measure curtain length for ${heading.name}">
  `;
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
  $('#curtainLength').value = formatInput(state.curtainLengthIn);
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
    $('#grommetLengthCopy').textContent = `For Grommet Top curtains, ${allowanceLabel} is automatically added to your measured length.`;
  }
  $('#finishedLengthResult').textContent = formatDimension(finishedCurtainLength());
}

function renderLiveSummary() {
  const heading = selectedHeading();
  const items = [
    ['Rod / track width', formatDimension(curtainWidth())],
    ['Heading style', heading?.name || '—'],
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
    ['Measured curtain length', formatDimension(state.curtainLengthIn)],
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

  if (state.step === 3) renderFullnessOptions();
  if (state.step === 5) renderLengthGuide();
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

function validateStep() {
  clearErrors();
  if (state.step === 1 && curtainWidth() == null) {
    $('#step1Error').textContent = state.widthMethod === 'direct'
      ? 'Enter the installed rod or track length.'
      : 'Enter the window width to calculate the recommended rod length.';
    return false;
  }
  if (state.step === 2 && !state.headingId) {
    $('#step2Error').textContent = 'Choose a heading style to continue.';
    return false;
  }
  if (state.step === 3 && state.fullness == null) {
    $('#step3Error').textContent = 'Choose a fullness ratio to continue.';
    return false;
  }
  if (state.step === 5 && state.curtainLengthIn == null) {
    $('#step5Error').textContent = 'Enter the measured curtain length.';
    return false;
  }
  return true;
}

function goToStep(step) {
  state.step = Math.max(1, Math.min(6, step));
  state.highestStep = Math.max(state.highestStep, Math.min(state.step, 5));
  renderStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function specificationText() {
  const heading = selectedHeading();
  return [
    'NESTWELL STUDIO CURTAIN SPECIFICATION',
    `Rod or track width: ${formatDimension(curtainWidth())}`,
    `Heading style: ${heading.name}`,
    `Fullness: ${state.fullness.toFixed(1)}x`,
    `Total fabric width: ${formatDimension(fabricWidth())}`,
    `Panels: ${state.panels}`,
    `Width per panel: ${formatDimension(panelWidth())}`,
    `Measured curtain length: ${formatDimension(state.curtainLengthIn)}`,
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
  const element = appendXmlElement(documentNode, parent, name, Number(value.toFixed(2)));
  element.setAttribute('unit', state.unit);
  return element;
}

function specificationXml() {
  const heading = selectedHeading();
  const xmlDocument = document.implementation.createDocument('', 'curtainSpecification');
  const root = xmlDocument.documentElement;
  root.setAttribute('version', '1.0');
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
  const headingElement = appendXmlElement(xmlDocument, style, 'headingStyle', heading.name);
  headingElement.setAttribute('id', heading.id);
  appendXmlElement(xmlDocument, style, 'fullnessRatio', state.fullness);

  const fabric = xmlDocument.createElement('fabric');
  root.append(fabric);
  appendXmlDimension(xmlDocument, fabric, 'totalFabricWidth', fabricWidth());
  appendXmlElement(xmlDocument, fabric, 'panelCount', state.panels);
  appendXmlDimension(xmlDocument, fabric, 'widthPerPanel', panelWidth());

  const length = xmlDocument.createElement('length');
  root.append(length);
  appendXmlDimension(xmlDocument, length, 'measuredCurtainLength', state.curtainLengthIn);
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
    curtainLengthIn: null,
  });
  $('#measurementForm').reset();
  $('input[name="unit"][value="in"]').checked = true;
  $('input[name="widthMethod"][value="direct"]').checked = true;
  $('input[name="extension"][value="12"]').checked = true;
  $('input[name="panels"][value="2"]').checked = true;
  $('#copyStatus').textContent = '';
  clearErrors();
  renderHeadingOptions();
  renderFullnessOptions();
  renderAll();
  goToStep(1);
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeadingOptions();
  renderFullnessOptions();
  renderAll();
  renderStep();

  $$('input[name="unit"]').forEach((input) => input.addEventListener('change', (event) => {
    state.unit = event.target.value;
    renderAll();
    if (state.step === 5) renderLengthGuide();
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

  $('#curtainLength').addEventListener('input', (event) => {
    state.curtainLengthIn = inputToInches(event.target.value);
    clearErrors();
    renderLengthCalculation();
    renderLiveSummary();
  });

  $('#nextButton').addEventListener('click', () => {
    if (!validateStep()) return;
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