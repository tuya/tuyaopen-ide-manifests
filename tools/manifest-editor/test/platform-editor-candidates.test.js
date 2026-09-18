import assert from 'node:assert/strict';
import test from 'node:test';

globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
};

const { isCandidateGpio, isCandidateRangeList } = await import('../frontend/js/platform-editor.js');

test('routable candidates accept individual GPIOs and inclusive ranges', () => {
  const candidates = [0, 2, [8, 28], [30, 40], [42, 61]];

  assert.equal(isCandidateGpio(candidates, 0), true);
  assert.equal(isCandidateGpio(candidates, 2), true);
  assert.equal(isCandidateGpio(candidates, 8), true);
  assert.equal(isCandidateGpio(candidates, 28), true);
  assert.equal(isCandidateGpio(candidates, 30), true);
  assert.equal(isCandidateGpio(candidates, 61), true);
  assert.equal(isCandidateGpio(candidates, 1), false);
  assert.equal(isCandidateGpio(candidates, 29), false);
  assert.equal(isCandidateGpio(candidates, 41), false);
});

test('invalid candidate entries do not make extra GPIOs selectable', () => {
  assert.equal(isCandidateGpio([[28, 8], [1], '2'], 8), false);
  assert.equal(isCandidateGpio(null, 8), false);
});

test('range editor is used only for range-form candidates', () => {
  assert.equal(isCandidateRangeList([[8, 25], [33, 40]]), true);
  assert.equal(isCandidateRangeList([]), true);
  assert.equal(isCandidateRangeList([8, 9]), false);
  assert.equal(isCandidateRangeList([[8, 25], 33]), false);
});
