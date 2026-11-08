import test from 'node:test';
import assert from 'node:assert/strict';
import { analyseHand, GestureFilter, OneEuro } from '../src/gestures.js';
import { SnapDetector, TransientDetector } from '../src/snap.js';

// Build a synthetic hand: palm length 1, fingers fan upward; `curl` folds a finger into the palm.
function hand({ index = 1, middle = 1, ring = 1, pinky = 1, pinch = false, thumbOnMiddle = false } = {}) {
  const pts = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  const set = (i, x, y, z = 0) => { pts[i] = { x, y, z }; };
  const finger = (mcp, x, extend) => {
    set(mcp, x, 1);
    if (extend) { set(mcp + 1, x, 1.4); set(mcp + 2, x, 1.7); set(mcp + 3, x, 2.0); }
    else { set(mcp + 1, x, 1.35); set(mcp + 2, x, 1.05, 0.3); set(mcp + 3, x, 0.8, 0.3); }
  };
  finger(5, -0.3, index);
  finger(9, -0.1, middle);
  finger(13, 0.1, ring);
  finger(17, 0.3, pinky);
  set(1, -0.3, 0.3); set(2, -0.5, 0.5); set(3, -0.7, 0.7); set(4, -0.9, 0.9);
  if (pinch) pts[4] = { ...pts[8], z: 0.05 };
  if (thumbOnMiddle) pts[4] = { ...pts[12], z: 0.05 };
  return analyseHand(pts, pts);
}

test('recognises each gesture', () => {
  assert.equal(hand().gesture, 'open');
  assert.equal(hand({ index: 0, middle: 0, ring: 0, pinky: 0 }).gesture, 'fist');
  assert.equal(hand({ ring: 0, pinky: 0 }).gesture, 'peace');
  assert.equal(hand({ middle: 0, ring: 0, pinky: 0 }).gesture, 'point');
  assert.equal(hand({ pinky: 0 }).gesture, 'three');
  assert.equal(hand({ pinch: true }).gesture, 'pinch');
});

test('openness tracks how far the hand is open', () => {
  assert.ok(hand().openness > 0.9);
  assert.ok(hand({ index: 0, middle: 0, ring: 0, pinky: 0 }).openness < 0.1);
});

test('snap pose needs the thumb near the middle finger', () => {
  assert.equal(hand({ thumbOnMiddle: true }).snapReady, true);
  assert.equal(hand().snapReady, false);
});

test('GestureFilter ignores a pose that is only passed through', () => {
  const f = new GestureFilter(100);
  assert.equal(f.update('open', 0), 'none');
  assert.equal(f.update('open', 120), 'open');
  assert.equal(f.update('peace', 140), 'open');
  assert.equal(f.update('fist', 180), 'open');
  assert.equal(f.update('fist', 300), 'fist');
});

test('OneEuro smooths jitter on a still value', () => {
  const f = new OneEuro();
  let last = 0;
  for (let i = 0; i < 60; i++) last = f.update(0.5 + (i % 2 ? 0.01 : -0.01), i * 33);
  assert.ok(Math.abs(last - 0.5) < 0.006);
});

function runAudio(levels, stepMs = 16) {
  const d = new TransientDetector();
  let hits = 0;
  levels.forEach((l, i) => { if (d.feed(l, 1000 + i * stepMs)) hits++; });
  return hits;
}

test('hears a short click over a quiet room', () => {
  const quiet = Array(60).fill(0.004);
  assert.equal(runAudio([...quiet, 0.3, 0.1, 0.02, 0.005, 0.004, 0.004, 0.004, 0.004]), 1);
});

test('sustained loud sound (speech, music) is not a snap', () => {
  const quiet = Array(60).fill(0.004);
  assert.equal(runAudio([...quiet, ...Array(40).fill(0.3)]), 0);
});

test('quiet ticks below the threshold are ignored', () => {
  const quiet = Array(60).fill(0.004);
  assert.equal(runAudio([...quiet, 0.02, 0.004, 0.004, 0.004, 0.004, 0.004]), 0);
});

// Stands in for the Web Audio analyser so the mic path can be driven frame by frame.
function micSnap() {
  const snaps = [];
  const s = new SnapDetector(() => snaps.push(1));
  s.mode = 'mic';
  s.buffer = new Float32Array(4);
  let level = 0.004;
  s.analyser = { getFloatTimeDomainData: (b) => b.fill(level) };
  const click = (t, hands) => {
    for (let i = 0; i < 40; i++) { level = 0.004; s.update(hands, t + i * 16); }
    level = 0.3; s.update(hands, t + 640);
    level = 0.01; s.update(hands, t + 656);
    s.update(hands, t + 730);
  };
  return { s, snaps, click };
}

test('a click counts as a snap only if a hand was in the snap pose', () => {
  const ready = [{ snapReady: true, thumbMiddle: 0.2 }];
  const { snaps, click } = micSnap();
  click(1000, ready);
  assert.equal(snaps.length, 1);
});

test('a loud click with no hand, or a hand far from the pose, is ignored', () => {
  const { snaps, click } = micSnap();
  click(1000, []);
  click(3000, [{ snapReady: false, thumbMiddle: 1.5 }]);
  assert.equal(snaps.length, 0);
});

test('without a mic, touching thumb to middle and flicking away snaps', () => {
  const snaps = [];
  const s = new SnapDetector(() => snaps.push(1));
  const touch = [{ snapReady: true, thumbMiddle: 0.2 }];
  const away = [{ snapReady: false, thumbMiddle: 1.2 }];
  s.update(touch, 1000);
  s.update(touch, 1200);
  s.update(away, 1250);
  assert.equal(snaps.length, 1);
  s.update(touch, 9000);
  s.update(touch, 12000);
  s.update(away, 12050); // held for seconds: resting, not snapping
  assert.equal(snaps.length, 1);
});

test('switching gestures need a longer, deliberate hold', () => {
  const f = new GestureFilter(100);
  f.update('open', 0);
  f.update('open', 120);
  f.update('peace', 200);
  assert.equal(f.update('peace', 330), 'open'); // a quick pass through peace does nothing
  assert.equal(f.update('peace', 460), 'peace');
});
