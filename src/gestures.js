// Pure hand-pose logic: no browser APIs, so it can be unit-tested.
// Landmark indices follow MediaPipe: 0 wrist, 4 thumb tip, 8 index tip, 12 middle tip...

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
const clamp01 = (v) => Math.min(1, Math.max(0, v));

const FINGERS = [
  { name: 'index', mcp: 5, pip: 6, tip: 8 },
  { name: 'middle', mcp: 9, pip: 10, tip: 12 },
  { name: 'ring', mcp: 13, pip: 14, tip: 16 },
  { name: 'pinky', mcp: 17, pip: 18, tip: 20 },
];

const OPEN_LOW = 1.1; // fingertip-to-wrist in palm lengths: a closed fist
const OPEN_HIGH = 1.8; // and a fully spread hand
const PINCH_TOUCH = 0.34;
const SNAP_READY = 0.7;

export function analyseHand(world, image) {
  const wrist = world[0];
  const palm = dist(wrist, world[9]) || 1;

  const extended = {};
  let reach = 0;
  for (const f of FINGERS) {
    const tip = dist(world[f.tip], wrist);
    extended[f.name] = tip > dist(world[f.pip], wrist) * 1.12;
    reach += tip / palm;
  }
  reach /= FINGERS.length;
  const openness = clamp01((reach - OPEN_LOW) / (OPEN_HIGH - OPEN_LOW));

  const thumbIndex = dist(world[4], world[8]) / palm;
  const thumbMiddle = dist(world[4], world[12]) / palm;
  const indexReach = dist(world[8], wrist) / palm;

  const { index, middle, ring, pinky } = extended;
  const count = [index, middle, ring, pinky].filter(Boolean).length;

  let gesture = 'relaxed';
  if (thumbIndex < PINCH_TOUCH && indexReach > 1.15) gesture = 'pinch';
  else if (count === 0 && openness < 0.4) gesture = 'fist';
  else if (index && middle && !ring && !pinky) gesture = 'peace';
  else if (index && middle && ring && !pinky) gesture = 'three';
  else if (index && !middle && !ring && !pinky) gesture = 'point';
  else if (count === 4 && openness > 0.45) gesture = 'open';

  const palmCentre = [0, 5, 9, 13, 17].reduce(
    (s, i) => ({ x: s.x + image[i].x / 5, y: s.y + image[i].y / 5 }),
    { x: 0, y: 0 },
  );

  return {
    gesture,
    openness,
    snapReady: thumbMiddle < SNAP_READY,
    thumbMiddle,
    palm: palmCentre,
    indexTip: { x: image[8].x, y: image[8].y },
    pinchPoint: { x: (image[4].x + image[8].x) / 2, y: (image[4].y + image[8].y) / 2 },
    image,
  };
}

// A gesture only counts once held briefly, so passing through a pose while
// moving between two others doesn't fire anything. The ones that change the
// object need a longer hold, since a hand relaxing can briefly look like them.
const DELIBERATE_MS = { peace: 250, three: 250 };

export class GestureFilter {
  constructor(holdMs = 110) {
    this.holdMs = holdMs;
    this.current = 'none';
    this.candidate = 'none';
    this.since = 0;
  }

  update(raw, now) {
    if (raw !== this.candidate) { this.candidate = raw; this.since = now; }
    if (raw !== this.current && now - this.since >= (DELIBERATE_MS[raw] ?? this.holdMs)) this.current = raw;
    return this.current;
  }
}

// One-euro filter: heavy smoothing when still (no jitter), light when moving (no lag).
export class OneEuro {
  constructor(minCutoff = 1.4, beta = 0.02, dCutoff = 1) {
    Object.assign(this, { minCutoff, beta, dCutoff, x: null, dx: 0, t: 0 });
  }

  update(value, now) {
    if (this.x === null) { this.x = value; this.t = now; return value; }
    const dt = Math.max(1e-3, (now - this.t) / 1000);
    const a = (c) => 1 / (1 + 1 / (2 * Math.PI * c * dt));
    const dx = (value - this.x) / dt;
    this.dx += a(this.dCutoff) * (dx - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += a(cutoff) * (value - this.x);
    this.t = now;
    return this.x;
  }

  reset() { this.x = null; this.dx = 0; }
}
