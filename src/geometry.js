// Tiny surface-sampling toolkit. Every shape is a "P": an area plus a function
// that writes one random surface point and its normal into out[0..5].
// Chaining (.rot().at()) applies transforms in the order written.

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const norm = (o, i = 3) => {
  const l = Math.hypot(o[i], o[i + 1], o[i + 2]) || 1;
  o[i] /= l; o[i + 1] /= l; o[i + 2] /= l;
};

export class P {
  constructor(area, fn) { this.area = area; this.fn = fn; }

  at(x = 0, y = 0, z = 0) {
    const f = this.fn;
    return new P(this.area, (r, o) => { f(r, o); o[0] += x; o[1] += y; o[2] += z; });
  }

  rot(x = 0, y = 0, z = 0) {
    const f = this.fn;
    const [cx, sx, cy, sy, cz, sz] = [Math.cos(x), Math.sin(x), Math.cos(y), Math.sin(y), Math.cos(z), Math.sin(z)];
    const turn = (o, i) => {
      let a = o[i], b = o[i + 1], c = o[i + 2], t;
      t = b * cx - c * sx; c = b * sx + c * cx; b = t;
      t = a * cy + c * sy; c = -a * sy + c * cy; a = t;
      t = a * cz - b * sz; b = a * sz + b * cz; a = t;
      o[i] = a; o[i + 1] = b; o[i + 2] = c;
    };
    return new P(this.area, (r, o) => { f(r, o); turn(o, 0); turn(o, 3); });
  }

  scale(sx, sy = sx, sz = sx) {
    const f = this.fn;
    const k = (sx * sy + sy * sz + sx * sz) / 3;
    return new P(this.area * Math.abs(k), (r, o) => {
      f(r, o);
      o[0] *= sx; o[1] *= sy; o[2] *= sz;
      o[3] /= sx; o[4] /= sy; o[5] /= sz;
      norm(o);
    });
  }

  // This shape plus its copy reflected across the YZ plane.
  mirror() {
    return group(this, this.scale(-1, 1, 1));
  }
}

function pick(cum, r) {
  const v = r * cum[cum.length - 1];
  for (let i = 0; i < cum.length; i++) if (v <= cum[i]) return i;
  return cum.length - 1;
}

export function group(...items) {
  const list = items.flat(Infinity).filter(Boolean);
  const cum = [];
  let total = 0;
  for (const p of list) { total += p.area; cum.push(total); }
  return new P(total, (r, o) => list[pick(cum, r())].fn(r, o));
}

export const repeat = (n, f) => group(Array.from({ length: n }, (_, i) => f(i, n)));

// Triangles: [[ax,ay,az],[bx,by,bz],[cx,cy,cz]]
export function mesh(tris) {
  const data = tris.map(([a, b, c]) => {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const len = Math.hypot(...n) || 1;
    return { a, u, v, n: n.map((q) => q / len), area: len / 2 };
  });
  const cum = [];
  let total = 0;
  for (const t of data) { total += t.area; cum.push(total); }
  return new P(total, (r, o) => {
    const t = data[pick(cum, r())];
    let s = r(), q = r();
    if (s + q > 1) { s = 1 - s; q = 1 - q; }
    for (let i = 0; i < 3; i++) { o[i] = t.a[i] + t.u[i] * s + t.v[i] * q; o[i + 3] = t.n[i]; }
  });
}

export function box(w, h, d) {
  const [x, y, z] = [w / 2, h / 2, d / 2];
  const A = w * d, B = w * h, C = h * d;
  const cum = [A, 2 * A, 2 * A + B, 2 * A + 2 * B, 2 * A + 2 * B + C, 2 * A + 2 * B + 2 * C];
  return new P(cum[5], (r, o) => {
    const f = pick(cum, r());
    const a = r() * 2 - 1, b = r() * 2 - 1;
    o[3] = o[4] = o[5] = 0;
    if (f < 2) { const s = f ? -1 : 1; o[0] = a * x; o[1] = s * y; o[2] = b * z; o[4] = s; }
    else if (f < 4) { const s = f === 3 ? -1 : 1; o[0] = a * x; o[1] = b * y; o[2] = s * z; o[5] = s; }
    else { const s = f === 5 ? -1 : 1; o[0] = s * x; o[1] = a * y; o[2] = b * z; o[3] = s; }
  });
}

// Solid extruded along Y from a star-shaped outline of [x, z] points.
export function prism(poly, h = 1) {
  const n = poly.length;
  const cx = poly.reduce((s, p) => s + p[0], 0) / n;
  const cz = poly.reduce((s, p) => s + p[1], 0) / n;
  const tris = [];
  const y = h / 2;
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n];
    tris.push([[cx, y, cz], [b[0], y, b[1]], [a[0], y, a[1]]]);
    tris.push([[cx, -y, cz], [a[0], -y, a[1]], [b[0], -y, b[1]]]);
    tris.push([[a[0], -y, a[1]], [a[0], y, a[1]], [b[0], y, b[1]]]);
    tris.push([[a[0], -y, a[1]], [b[0], y, b[1]], [b[0], -y, b[1]]]);
  }
  const m = mesh(tris);
  // Outline winding can go either way, so point normals away from the middle.
  const f = m.fn;
  return new P(m.area, (r, o) => {
    f(r, o);
    if (Math.abs(o[4]) > 0.9) { o[4] = Math.sign(o[1]) || 1; return; }
    if (o[3] * (o[0] - cx) + o[5] * (o[2] - cz) < 0) { o[3] = -o[3]; o[5] = -o[5]; }
  });
}

// Square-section frustum along Y (w0 wide at y0, w1 wide at y1). Pyramids, steps, plinths.
export function frustum(w0, w1, y0, y1, d0 = w0, d1 = w1) {
  const c = (w, d, y) => [[-w / 2, y, -d / 2], [w / 2, y, -d / 2], [w / 2, y, d / 2], [-w / 2, y, d / 2]];
  const a = c(w0, d0, y0), b = c(w1, d1, y1);
  const tris = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    tris.push([a[i], b[i], b[j]], [a[i], b[j], a[j]]);
  }
  tris.push([b[0], b[2], b[1]], [b[0], b[3], b[2]], [a[0], a[1], a[2]], [a[0], a[2], a[3]]);
  return mesh(tris);
}

// Catmull-Rom through points of any dimension.
export function smooth(pts, sub = 8, closed = false) {
  const n = pts.length;
  if (n < 3) return pts;
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const out = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let s = 0; s < sub; s++) {
      const t = s / sub, t2 = t * t, t3 = t2 * t;
      out.push(p1.map((_, k) => 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(closed ? out[0].slice() : pts[n - 1].slice());
  return out;
}

// Surface of revolution about Y. profile: [[radius, y], ...], y ascending for outward normals.
export function lathe(profile, { curve = false, caps = true } = {}) {
  const prof = curve ? smooth(profile, 6).map(([a, b]) => [Math.max(0, a), b]) : profile;
  const segs = [];
  let total = 0;
  const cum = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const [r1, y1] = prof[i], [r2, y2] = prof[i + 1];
    const L = Math.hypot(r2 - r1, y2 - y1);
    if (L < 1e-9) continue;
    const area = Math.PI * (r1 + r2) * L;
    if (area < 1e-12) continue;
    total += area; cum.push(total);
    segs.push({ r1, y1, r2, y2, nr: (y2 - y1) / L, ny: -(r2 - r1) / L });
  }
  const capAt = (i, sign) => {
    const [ra, ya] = prof[i];
    if (!caps || ra <= 1e-6) return;
    total += Math.PI * ra * ra; cum.push(total);
    segs.push({ cap: true, ra, ya, sign });
  };
  capAt(0, -1);
  capAt(prof.length - 1, 1);
  return new P(total, (r, o) => {
    const s = segs[pick(cum, r())];
    const a = r() * Math.PI * 2;
    const c = Math.cos(a), d = Math.sin(a);
    if (s.cap) {
      const q = Math.sqrt(r()) * s.ra;
      o[0] = c * q; o[1] = s.ya; o[2] = d * q; o[3] = 0; o[4] = s.sign; o[5] = 0;
      return;
    }
    const u = r();
    const dr = s.r2 - s.r1;
    const t = Math.abs(dr) < 1e-6 ? u : (Math.sqrt(s.r1 * s.r1 + u * (s.r2 * s.r2 - s.r1 * s.r1)) - s.r1) / dr;
    const q = s.r1 + dr * t;
    o[0] = c * q; o[1] = s.y1 + (s.y2 - s.y1) * t; o[2] = d * q;
    o[3] = c * s.nr; o[4] = s.ny; o[5] = d * s.nr;
  });
}

// Cylinder or cone along Y from y0 to y1.
export const cy = (r, y0, y1, r2 = r) => lathe([[r, y0], [r2, y1]]);
export const cyl = (r, h) => cy(r, -h / 2, h / 2);
export const washer = (ro, ri, h) => lathe([[ri, -h / 2], [ro, -h / 2], [ro, h / 2], [ri, h / 2]], { caps: false });

export function sph(rx, ry = rx, rz = rx, { bump = 0, freq = 3, phase = 0 } = {}) {
  const p = 1.6075;
  const area = 4 * Math.PI * (((rx * ry) ** p + (rx * rz) ** p + (ry * rz) ** p) / 3) ** (1 / p);
  return new P(area, (r, o) => {
    const z = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - z * z);
    const x = s * Math.cos(a), y = s * Math.sin(a);
    const k = bump
      ? 1 + bump * (Math.sin(freq * x + phase) * Math.sin(freq * 1.3 * y + phase * 2) + 0.5 * Math.sin(freq * 2.7 * z + phase) * Math.sin(freq * 2.1 * x))
      : 1;
    o[0] = x * rx * k; o[1] = y * ry * k; o[2] = z * rz * k;
    o[3] = x / rx; o[4] = y / ry; o[5] = z / rz;
    norm(o);
  });
}

export function torus(R, r) {
  return new P(4 * Math.PI * Math.PI * R * r, (rnd, o) => {
    const u = rnd() * Math.PI * 2;
    let v;
    do { v = rnd() * Math.PI * 2; } while (rnd() * (R + r) > R + r * Math.cos(v));
    const c = R + r * Math.cos(v);
    o[0] = Math.cos(u) * c; o[1] = r * Math.sin(v); o[2] = Math.sin(u) * c;
    o[3] = Math.cos(u) * Math.cos(v); o[4] = Math.sin(v); o[5] = Math.sin(u) * Math.cos(v);
  });
}

// Tube along a path; radius is a number or one value per control point. Curved when `curve`.
export function tube(points, radius, { curve = true, closed = false, sub = 8 } = {}) {
  const pr = points.map((p, i) => [...p, Array.isArray(radius) ? radius[i] : radius]);
  const path = curve && pr.length > 2 ? smooth(pr, sub, closed) : pr;
  const segs = [];
  const cum = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const L = Math.hypot(...d);
    if (L < 1e-9) continue;
    d[0] /= L; d[1] /= L; d[2] /= L;
    const ref = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const u = [d[1] * ref[2] - d[2] * ref[1], d[2] * ref[0] - d[0] * ref[2], d[0] * ref[1] - d[1] * ref[0]];
    const ul = Math.hypot(...u);
    u[0] /= ul; u[1] /= ul; u[2] /= ul;
    const v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
    total += Math.PI * (a[3] + b[3]) * L;
    cum.push(total);
    segs.push({ a, b, u, v });
  }
  return new P(total, (r, o) => {
    const s = segs[pick(cum, r())];
    const t = r(), th = r() * Math.PI * 2;
    const c = Math.cos(th), q = Math.sin(th);
    const rad = s.a[3] + (s.b[3] - s.a[3]) * t;
    for (let i = 0; i < 3; i++) {
      const n = s.u[i] * c + s.v[i] * q;
      o[i] = s.a[i] + (s.b[i] - s.a[i]) * t + n * rad;
      o[i + 3] = n;
    }
  });
}

export const rod = (a, b, r) => tube([a, b], r, { curve: false });

export function gear(R, root, teeth, h) {
  const poly = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2, w = (Math.PI * 2) / teeth;
    for (const [f, rad] of [[0, root], [0.2, R], [0.5, R], [0.7, root]]) {
      poly.push([Math.cos(a + w * f) * rad, Math.sin(a + w * f) * rad]);
    }
  }
  return prism(poly, h);
}

export const ringPts = (r, n, y = 0, start = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = start + (i / n) * Math.PI * 2;
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  });

export const part = (name, note, color, prims, out) => ({
  name, note, color, shape: Array.isArray(prims) ? group(prims) : prims, out,
});

export const C = {
  red: '#e4572e', teal: '#2ec4b6', gold: '#f2c14e', violet: '#a78bfa', blue: '#4aa3ff', pink: '#ff7aa2',
  green: '#7bd389', orange: '#ff9f43', grey: '#b8c2cc', white: '#f5f7fa', sand: '#e5c99a', brown: '#b5835a',
  crimson: '#c9304f', cyan: '#5fd9e8',
};
