import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_OBJECTS, CATEGORIES, stepObject } from '../src/catalog/index.js';
import { compileObject } from '../src/compile.js';

test('catalog matches the demo counts', () => {
  assert.deepEqual(CATEGORIES.map((c) => [c.id, c.items.length]), [
    ['Wonders', 11], ['Anatomy', 10], ['Biology', 2], ['Engines', 4], ['Vehicles', 4], ['Machines', 2],
  ]);
  assert.equal(new Set(ALL_OBJECTS.map((o) => o.id)).size, 33);
});

test('switching runs on across categories and wraps at both ends', () => {
  assert.equal(stepObject('knee', 1).id, 'animal-cell'); // Anatomy -> Biology
  assert.equal(stepObject('animal-cell', -1).id, 'knee');
  assert.equal(stepObject('mechanical-watch', 1).id, 'eiffel');
  assert.equal(stepObject('eiffel', -1).id, 'mechanical-watch');
});

for (const def of ALL_OBJECTS) {
  test(`${def.name} compiles to valid, unit-fitted particles`, () => {
    const count = 20000;
    const c = compileObject(def, count);
    assert.equal(c.position.length, count * 3);
    let max = 0;
    for (let i = 0; i < count * 3; i++) {
      assert.ok(Number.isFinite(c.position[i]), `position ${i}`);
      assert.ok(Number.isFinite(c.normal[i]), `normal ${i}`);
      assert.ok(Number.isFinite(c.offset[i]), `offset ${i}`);
    }
    for (let i = 0; i < count; i++) max = Math.max(max, Math.hypot(c.position[i * 3], c.position[i * 3 + 1], c.position[i * 3 + 2]));
    assert.ok(max <= 1.0001 && max > 0.9, `radius ${max}`);
    assert.ok(c.parts.length >= 5, 'at least five labelled parts');
    for (const p of c.parts) {
      assert.ok(p.note.length > 8 && p.note.length < 70, `note length: ${p.name}`);
      assert.match(p.color, /^#[0-9a-f]{6}$/i);
    }
  });
}
