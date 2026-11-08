import test from 'node:test';
import assert from 'node:assert/strict';
import { HandTracks, predictPalm, twoHandPose, wrapAngle } from '../src/hands.js';

// An open hand centred at (cx, cy) in image coordinates.
function rawHand(cx, cy, side) {
  const world = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  const set = (i, x, y) => { world[i] = { x, y, z: 0 }; };
  [[5, -0.3], [9, -0.1], [13, 0.1], [17, 0.3]].forEach(([m, x]) => { set(m, x, 1); set(m + 1, x, 1.4); set(m + 2, x, 1.7); set(m + 3, x, 2); });
  set(1, -0.3, 0.3); set(2, -0.5, 0.5); set(3, -0.7, 0.7); set(4, -0.9, 0.9);
  const image = world.map((p) => ({ x: cx + p.x * 0.05, y: cy - p.y * 0.05 + 0.05, z: 0 }));
  return { world, image, side };
}

const identity = (p) => ({ x: p.x * 1000, y: p.y * 1000 });

test('each hand keeps its identity even when the left/right label and order flip', () => {
  const t = new HandTracks(identity);
  t.update([rawHand(0.3, 0.5, 'Left'), rawHand(0.7, 0.5, 'Right')], 0);
  const [a, b] = t.hands.map((h) => h.key);
  t.update([rawHand(0.71, 0.5, 'Left'), rawHand(0.31, 0.5, 'Left')], 33);
  const byX = Object.fromEntries(t.hands.map((h) => [h.screenPalm.x < 500 ? 'left' : 'right', h.key]));
  assert.equal(byX.left, a);
  assert.equal(byX.right, b);
});

test('a hand that drops out for a frame is still held, then let go', () => {
  const t = new HandTracks(identity);
  t.update([rawHand(0.3, 0.5), rawHand(0.7, 0.5)], 0);
  t.update([rawHand(0.3, 0.5)], 40);
  assert.equal(t.hands.length, 2);
  t.update([rawHand(0.3, 0.5)], 400);
  assert.equal(t.hands.length, 1);
});

test('prediction leads in the direction the hand is moving', () => {
  const t = new HandTracks(identity);
  for (let i = 0; i < 10; i++) t.update([rawHand(0.2 + i * 0.02, 0.5)], i * 33);
  const h = t.hands[0];
  assert.ok(h.vx > 200, `velocity ${h.vx}`);
  assert.ok(predictPalm(h, h.t + 10).x > h.screenPalm.x);
});

test('two-hand spread is measured in palm lengths', () => {
  const t = new HandTracks(identity);
  t.update([rawHand(0.3, 0.5), rawHand(0.7, 0.5)], 0);
  const [a, b] = t.hands;
  const pose = twoHandPose(a, b, 0);
  assert.ok(Math.abs(pose.spread - pose.spreadPx / a.palmPx) < 1e-6);
  assert.ok(Math.abs(pose.mid.x - 500) < 20);
});

test('wrapAngle keeps twists within half a turn', () => {
  assert.ok(Math.abs(wrapAngle(Math.PI * 1.9) - -Math.PI * 0.1) < 1e-9);
});
