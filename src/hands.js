// Keeps each physical hand's identity across camera frames and smooths its motion.
// Hands are matched by position, not by MediaPipe's left/right label: that label
// flips now and then, which used to swap the two hands and jerk the object.
import { analyseHand, GestureFilter, OneEuro } from './gestures.js';

const MATCH_RADIUS = 0.3; // in image widths: farther than this is a different hand
const GRACE_MS = 180; // a hand missing for a frame or two is still held
const LEAD_MS = 35; // predict this far ahead to cover camera + tracking delay
const MAX_PREDICT_MS = 90;
const MAX_HANDS = 2;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

class Track {
  constructor(id) {
    this.id = id;
    this.filter = new GestureFilter();
    this.x = new OneEuro(1.2, 0.05);
    this.y = new OneEuro(1.2, 0.05);
    this.open = new OneEuro(2, 0.05);
    this.previous = 'none';
    this.state = null;
  }

  ingest(a, now, toScreen, changes) {
    const gesture = this.filter.update(a.gesture, now);
    if (gesture !== this.previous) changes.push(gesture);
    this.previous = gesture;

    const raw = toScreen(a.palm);
    const x = this.x.update(raw.x, now), y = this.y.update(raw.y, now);
    let vx = 0, vy = 0;
    const last = this.state;
    if (last) {
      const dt = Math.max(1, now - last.t) / 1000;
      // Lightly smoothed, so one noisy frame doesn't fling the prediction.
      vx = last.vx + ((x - last.screenPalm.x) / dt - last.vx) * 0.5;
      vy = last.vy + ((y - last.screenPalm.y) / dt - last.vy) * 0.5;
    }
    const screenPoints = a.image.map(toScreen);
    this.palmMatch = a.palm;
    this.state = {
      ...a,
      key: this.id,
      gesture,
      openness: this.open.update(a.openness, now),
      screenPalm: { x, y },
      screenIndex: toScreen(a.indexTip),
      screenPoints,
      palmPx: dist(screenPoints[0], screenPoints[9]) || 1,
      vx,
      vy,
      t: now,
    };
  }
}

export class HandTracks {
  constructor(toScreen) {
    this.toScreen = toScreen;
    this.tracks = [];
    this.nextId = 1;
    this.changes = []; // gesture changes since last read; tracking can outpace drawing
  }

  update(raw, now) {
    const found = raw.map((h) => analyseHand(h.world, h.image));

    // Pair detections with existing hands, closest pairs first.
    const pairs = [];
    this.tracks.forEach((t, ti) => found.forEach((a, di) => {
      const d = dist(t.palmMatch, a.palm);
      if (d < MATCH_RADIUS) pairs.push({ ti, di, d });
    }));
    pairs.sort((p, q) => p.d - q.d);
    const usedT = new Set(), usedD = new Set();
    for (const p of pairs) {
      if (usedT.has(p.ti) || usedD.has(p.di)) continue;
      usedT.add(p.ti); usedD.add(p.di);
      this.tracks[p.ti].ingest(found[p.di], now, this.toScreen, this.changes);
    }
    found.forEach((a, di) => {
      if (usedD.has(di)) return;
      const t = new Track(this.nextId++);
      t.ingest(a, now, this.toScreen, this.changes);
      this.tracks.push(t);
    });

    this.tracks = this.tracks
      .filter((t) => now - t.state.t <= GRACE_MS)
      .sort((p, q) => q.state.t - p.state.t)
      .slice(0, MAX_HANDS)
      .sort((p, q) => p.id - q.id);
  }

  get hands() {
    return this.tracks.map((t) => t.state);
  }

  takeChanges() {
    const c = this.changes;
    this.changes = [];
    return c;
  }
}

// Where the palm is likely to be right now, a little ahead of the last camera frame.
export function predictPalm(h, now) {
  const ahead = Math.min(MAX_PREDICT_MS, Math.max(0, now - h.t + LEAD_MS)) / 1000;
  return { x: h.screenPalm.x + h.vx * ahead, y: h.screenPalm.y + h.vy * ahead };
}

// Midpoint, spacing and tilt of two hands. Spread is in palm lengths, so it
// means the same whether you stand near the camera or far from it.
export function twoHandPose(a, b, now) {
  const pa = predictPalm(a, now), pb = predictPalm(b, now);
  const dx = pb.x - pa.x, dy = pb.y - pa.y;
  return {
    mid: { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 },
    spreadPx: Math.hypot(dx, dy) || 1,
    spread: Math.hypot(dx, dy) / ((a.palmPx + b.palmPx) / 2),
    angle: Math.atan2(dy, dx),
  };
}

export const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
