'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { createContext, runInContext } = require('node:vm');

const source = readFileSync(join(__dirname, '..', 'app.js'), 'utf8');

function loadTool(state = {}) {
  const errors = new Map(
    ['step1Error', 'step2Error', 'heightError', 'finishStyleError', 'step4Error']
      .map((id) => [`#${id}`, { textContent: '' }]),
  );
  const context = createContext({
    document: {
      addEventListener() {},
      querySelector(selector) {
        assert.ok(errors.has(selector), `Unexpected DOM query: ${selector}`);
        return errors.get(selector);
      },
      querySelectorAll(selector) {
        assert.equal(selector, '.field-error');
        return Array.from(errors.values());
      },
    },
    window: { matchMedia: () => ({ matches: false }) },
  });
  runInContext(source, context);
  runInContext(`Object.assign(state, ${JSON.stringify(state)})`, context);
  return {
    evaluate: (expression) => runInContext(expression, context),
    error: (id) => errors.get(`#${id}`).textContent,
  };
}

test('starts on Heading with no height, finish, or final length', () => {
  const tool = loadTool();
  assert.equal(tool.evaluate('state.step'), 1);
  assert.equal(tool.evaluate('state.rodToFloorHeightIn'), null);
  assert.equal(tool.evaluate('state.finishId'), null);
  assert.equal(tool.evaluate('finishedCurtainLength()'), null);
});

test('validates Heading and Rod Width in their existing order', () => {
  const tool = loadTool();
  assert.equal(tool.evaluate('validateStep(1)'), false);
  assert.equal(tool.error('step1Error'), 'Choose a heading style to continue.');
  tool.evaluate("state.headingId = 'double-pleat'");
  assert.equal(tool.evaluate('validateStep(1)'), true);
  assert.equal(tool.evaluate('validateStep(2)'), false);
  assert.equal(tool.error('step2Error'), 'Enter the installed rod or track length.');
  tool.evaluate("state.widthMethod = 'window'");
  assert.equal(tool.evaluate('validateStep(2)'), false);
  assert.equal(tool.error('step2Error'), 'Enter the window width to calculate the recommended rod length.');
});

test('requires both height and finish in step 3', () => {
  const tool = loadTool();
  assert.equal(tool.evaluate('validateStep(3)'), false);
  assert.equal(tool.error('heightError'), 'Enter the height from the top of the rod to the floor.');
  tool.evaluate('state.rodToFloorHeightIn = 100');
  assert.equal(tool.evaluate('validateStep(3)'), false);
  assert.equal(tool.error('heightError'), '');
  assert.equal(tool.error('finishStyleError'), 'Choose a finish style to continue.');
  tool.evaluate("state.finishId = 'kiss-floor'");
  assert.equal(tool.evaluate('validateStep(3)'), true);
  assert.equal(tool.error('finishStyleError'), '');
});

const headings = ['double-pleat', 'single-pleat', 'four-claw-hook', 'rod-pocket', 'grommet', 'back-tab'];
const finishes = { 'above-floor': -0.5, 'kiss-floor': 0, puddle: 2 };

for (const headingId of headings) {
  for (const [finishId, offset] of Object.entries(finishes)) {
    for (const unit of ['in', 'cm']) {
      test(`${headingId}, ${finishId}, ${unit}: keeps finish and heading adjustments independent`, () => {
        const tool = loadTool({ headingId, finishId, unit });
        tool.evaluate(`state.rodToFloorHeightIn = inputToInches('${unit === 'cm' ? 254 : 100}')`);
        const expected = 100 + offset + (headingId === 'grommet' ? 2 : 0);
        assert.ok(Math.abs(tool.evaluate('finishedCurtainLength()') - expected) < 1e-10);
        assert.equal(tool.evaluate('validateStep(3)'), true);
        const display = tool.evaluate('displayValue(finishedCurtainLength())');
        assert.ok(Math.abs(display - expected * (unit === 'cm' ? 2.54 : 1)) < 1e-10);
      });
    }
  }
}

test('shows exact centimeter finish offsets without accumulating unit-switch rounding', () => {
  const tool = loadTool({ unit: 'cm', rodToFloorHeightIn: 99.123, finishId: 'above-floor' });
  assert.equal(tool.evaluate('finishName()'), '1.27 cm Above Floor');
  assert.equal(tool.evaluate('formatAdjustment(selectedFinish().offsetIn)'), '-1.27 cm');
  const before = tool.evaluate('finishedCurtainLength()');
  for (let index = 0; index < 10; index += 1) {
    tool.evaluate("state.unit = 'in'; formatInput(state.rodToFloorHeightIn); state.unit = 'cm'; formatInput(state.rodToFloorHeightIn)");
  }
  assert.equal(tool.evaluate('finishedCurtainLength()'), before);
  tool.evaluate("state.finishId = 'puddle'");
  assert.equal(tool.evaluate('finishName()'), '5.08 cm Puddle');
  assert.equal(tool.evaluate('formatAdjustment(selectedFinish().offsetIn)'), '+5.08 cm');
});

test('rejects missing, non-finite, zero and negative height input', () => {
  const tool = loadTool();
  for (const input of ['', '0', '-2', 'NaN', 'Infinity', '1e309']) {
    assert.equal(tool.evaluate(`inputToInches(${JSON.stringify(input)})`), null);
  }
});

test('rejects an above-floor finish that produces zero or negative length', () => {
  for (const height of [0.1, 0.5]) {
    const tool = loadTool({ rodToFloorHeightIn: height, finishId: 'above-floor' });
    assert.equal(tool.evaluate('finishedCurtainLength()'), null);
    assert.equal(tool.evaluate('validateStep(3)'), false);
    assert.match(tool.error('heightError'), /greater than zero/);
  }
});

test('keeps Fullness validation on step 4 and Panels as the final step', () => {
  const tool = loadTool();
  assert.equal(tool.evaluate('validateStep(4)'), false);
  assert.equal(tool.error('step4Error'), 'Choose a fullness ratio to continue.');
  tool.evaluate('state.fullness = 2');
  assert.equal(tool.evaluate('validateStep(4)'), true);
  assert.equal(tool.evaluate('validateStep(5)'), true);
});

test('retains direct/window fabric and panel width calculations', () => {
  const tool = loadTool({ rodWidthIn: 100, fullness: 1.8, panels: 2 });
  assert.equal(tool.evaluate('fabricWidth()'), 180);
  assert.equal(tool.evaluate('panelWidth()'), 90);
  tool.evaluate("state.widthMethod = 'window'; state.windowWidthIn = 88");
  assert.equal(tool.evaluate('curtainWidth()'), 100);
  assert.equal(tool.evaluate('panelWidth()'), 90);
});

test('copied specifications include the measurement basis and both adjustments', () => {
  const tool = loadTool({
    headingId: 'grommet',
    rodToFloorHeightIn: 100,
    finishId: 'above-floor',
    fullness: 2,
  });
  const text = tool.evaluate('specificationText()');
  assert.match(text, /Rod top to floor: 100 in/);
  assert.match(text, /Finish style: 1\/2" Above Floor/);
  assert.match(text, /Finish adjustment: -0.5 in/);
  assert.match(text, /Grommet adjustment: \+2 in/);
  assert.match(text, /Final curtain length: 101.5 in/);
  assert.doesNotMatch(text, /Measured curtain length/);
});
