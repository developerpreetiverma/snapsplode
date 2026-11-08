// Turns a catalog definition into the flat arrays the particle shader needs.
import { mulberry } from './geometry.js';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const EXPLODE_REACH = 0.42;
const EXPLODE_MIN = 0.2;
const MIN_SHARE = 0.012;
const PICK_SAMPLES = 48;
const COVERAGE = 1.55;

export function compileObject(def, count) {
  const rng = mulberry(def.id.length * 7919 + def.id.charCodeAt(0));
  const parts = def.parts;
  const totalArea = parts.reduce((s, p) => s + p.shape.area, 0);

  // Every part gets a floor so tiny details (valves, crowns) stay visible.
  const floor = Math.ceil(count * MIN_SHARE);
  const free = Math.max(0, count - floor * parts.length);
  const counts = parts.map((p) => floor + Math.floor((free * p.shape.area) / totalArea));
  counts[counts.indexOf(Math.max(...counts))] += count - counts.reduce((a, b) => a + b, 0);

  const position = new Float32Array(count * 3);
  const normal = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  const offset = new Float32Array(count * 3);
  const partId = new Float32Array(count);
  const o = [0, 0, 0, 0, 0, 0];

  let k = 0;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  const ranges = parts.map((p, id) => {
    const start = k;
    const rgb = hex(p.color);
    for (let i = 0; i < counts[id]; i++, k++) {
      p.shape.fn(rng, o);
      for (let a = 0; a < 3; a++) {
        position[k * 3 + a] = o[a];
        normal[k * 3 + a] = o[a + 3];
        color[k * 3 + a] = rgb[a];
        if (o[a] < min[a]) min[a] = o[a];
        if (o[a] > max[a]) max[a] = o[a];
      }
      partId[k] = id;
    }
    return [start, k];
  });

  // Centre on the bounding box and fit inside a unit sphere.
  const mid = min.map((v, a) => (v + max[a]) / 2);
  let radius = 0;
  for (let i = 0; i < count; i++) {
    const d = Math.hypot(position[i * 3] - mid[0], position[i * 3 + 1] - mid[1], position[i * 3 + 2] - mid[2]);
    if (d > radius) radius = d;
  }
  for (let i = 0; i < count; i++) for (let a = 0; a < 3; a++) position[i * 3 + a] = (position[i * 3 + a] - mid[a]) / radius;

  const info = parts.map((p, id) => {
    const [s, e] = ranges[id];
    const c = [0, 0, 0];
    for (let i = s; i < e; i++) for (let a = 0; a < 3; a++) c[a] += position[i * 3 + a];
    const anchor = c.map((v) => v / Math.max(1, e - s));
    const len = Math.hypot(...anchor);

    let dir;
    if (p.out) dir = p.out;
    else if (len < 0.05) {
      const t = (id * 2.399963) % (Math.PI * 2);
      dir = [Math.cos(t) * EXPLODE_MIN, 0.2, Math.sin(t) * EXPLODE_MIN];
    } else dir = anchor.map((v) => v * EXPLODE_REACH + (v / len) * EXPLODE_MIN);

    for (let i = s; i < e; i++) for (let a = 0; a < 3; a++) offset[i * 3 + a] = dir[a];

    // A handful of real surface points, used for "which part am I pointing at?"
    const step = Math.max(1, Math.floor((e - s) / PICK_SAMPLES));
    const pickPoints = [];
    for (let i = s; i < e; i += step) pickPoints.push([position[i * 3], position[i * 3 + 1], position[i * 3 + 2]]);
    return { name: p.name, note: p.note, color: p.color, anchor, offset: dir, pickPoints };
  });

  // Furthest any particle gets when fully pulled apart, so the view can fit it on screen.
  let explodedRadius = 1;
  for (let i = 0; i < count; i++) {
    const r = Math.hypot(position[i * 3] + offset[i * 3], position[i * 3 + 1] + offset[i * 3 + 1], position[i * 3 + 2] + offset[i * 3 + 2]);
    if (r > explodedRadius) explodedRadius = r;
  }

  // How wide a particle must be (in object units) for the surface to read as solid.
  const pointWorld = COVERAGE * Math.sqrt(totalArea / (radius * radius) / Math.max(1, free));

  return { def, count, position, normal, color, offset, partId, parts: info, pointWorld, explodedRadius };
}
