// 200k particles morphing on the GPU: every animated value is a uniform, so the
// frame cost does not grow with particle count on the JavaScript side.
import * as THREE from 'three';
import { mulberry } from './geometry.js';

const VERT = /* glsl */ `
  attribute vec3 aNormal;
  attribute vec3 aOffset;
  attribute vec3 aSphere;
  attribute vec3 aColor;
  attribute float aPart;
  attribute float aSeed;

  uniform float uForm, uExplode, uDissolve, uTime, uPointSize, uHighlight, uSphereRadius;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Each particle sets off at its own moment, so forming looks like a swarm.
    float start = aSeed * 0.55;
    float t = smoothstep(start, start + 0.45, uForm);

    float spin = uTime * (0.25 + aSeed * 0.25);
    vec3 s = aSphere * uSphereRadius;
    s = vec3(s.x * cos(spin) + s.z * sin(spin), s.y, -s.x * sin(spin) + s.z * cos(spin));

    vec3 home = position + aOffset * uExplode;
    vec3 p = mix(s, home, t);

    // Swirl in flight, zero at both ends of the morph.
    float flight = t * (1.0 - t) * 4.0;
    p += flight * 0.28 * vec3(
      sin(aSeed * 91.0 + uTime * 1.3),
      cos(aSeed * 47.0 + uTime * 1.1),
      sin(aSeed * 23.0 - uTime * 1.2));

    // Dissolving blows particles outward from wherever they are.
    float d = smoothstep(aSeed * 0.5, aSeed * 0.5 + 0.5, uDissolve);
    vec3 drift = normalize(aSphere + 0.001) * (0.4 + aSeed * 1.8);
    p += drift * d;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    vec3 n = normalize(normalMatrix * mix(aSphere, aNormal, t));
    vec3 light = normalize(vec3(-0.45, 0.7, 0.75));
    float diffuse = abs(dot(n, light));
    float rim = pow(1.0 - abs(n.z), 2.0);
    float shade = 0.5 + 0.5 * diffuse + 0.12 * rim;

    // White when assembled, part colours appear as it comes apart (as in the demo).
    float tint = 0.2 + 0.8 * smoothstep(0.02, 0.5, uExplode);
    vec3 base = mix(vec3(0.97, 0.98, 1.0), aColor, tint * t);
    float speckle = 0.9 + 0.1 * fract(aSeed * 311.7);
    vec3 col = base * shade * speckle;

    float dim = 1.0;
    if (uHighlight >= 0.0) {
      if (abs(aPart - uHighlight) < 0.5) col = mix(col, vec3(1.0), 0.15) * 1.25;
      else dim = 0.38;
    }

    vColor = col * dim;
    vAlpha = (1.0 - d) * (uHighlight >= 0.0 && dim < 1.0 ? 0.55 : 1.0);
    gl_PointSize = uPointSize * (1.0 + flight * 0.4) * (1.0 - d * 0.5) / max(0.1, -mv.z);
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    // Square particles: at these sizes they look the same as round ones, and skipping
    // the per-pixel circle test lets the GPU reject hidden particles far earlier.
    if (vAlpha < 0.02) discard;
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

function globeLines(radius, rings = 6, meridians = 8) {
  const pts = [];
  const seg = 48;
  const add = (f) => {
    for (let i = 0; i < seg; i++) pts.push(...f(i / seg), ...f((i + 1) / seg));
  };
  for (let m = 0; m < meridians; m++) {
    const a = (m / meridians) * Math.PI;
    add((t) => {
      const q = t * Math.PI * 2;
      return [Math.cos(a) * Math.sin(q) * radius, Math.cos(q) * radius, Math.sin(a) * Math.sin(q) * radius];
    });
  }
  for (let r = 1; r < rings; r++) {
    const lat = (r / rings) * Math.PI;
    add((t) => {
      const q = t * Math.PI * 2;
      return [Math.cos(q) * Math.sin(lat) * radius, Math.cos(lat) * radius, Math.sin(q) * Math.sin(lat) * radius];
    });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

export class ParticleField {
  constructor(scene, count) {
    this.count = count;
    const g = new THREE.BufferGeometry();
    const attr = (name, size) => {
      const a = new THREE.BufferAttribute(new Float32Array(count * size), size);
      a.setUsage(THREE.DynamicDrawUsage);
      g.setAttribute(name, a);
      return a;
    };
    this.attrs = {
      position: attr('position', 3), aNormal: attr('aNormal', 3), aOffset: attr('aOffset', 3),
      aColor: attr('aColor', 3), aPart: attr('aPart', 1),
    };

    // Sphere targets and seeds never change, so they upload only once.
    const rng = mulberry(42);
    const sphere = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const z = rng() * 2 - 1, a = rng() * Math.PI * 2, s = Math.sqrt(1 - z * z);
      const shell = 0.96 + rng() * 0.08;
      sphere[i * 3] = s * Math.cos(a) * shell;
      sphere[i * 3 + 1] = z * shell;
      sphere[i * 3 + 2] = s * Math.sin(a) * shell;
      seed[i] = rng();
    }
    g.setAttribute('aSphere', new THREE.BufferAttribute(sphere, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

    this.uniforms = {
      uForm: { value: 0 }, uExplode: { value: 0 }, uDissolve: { value: 1 }, uTime: { value: 0 },
      uPointSize: { value: 8 }, uHighlight: { value: -1 }, uSphereRadius: { value: 0.72 },
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms: this.uniforms, transparent: true,
    });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.geometry = g;

    this.root = new THREE.Group();
    this.root.add(this.points);
    scene.add(this.root);

    // Faint globe around the object; it stays upright while the object turns.
    this.globe = new THREE.LineSegments(
      globeLines(1.28),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }),
    );
    this.root.add(this.globe);
  }

  setObject(c) {
    const { attrs: a } = this;
    a.position.array.set(c.position);
    a.aNormal.array.set(c.normal);
    a.aOffset.array.set(c.offset);
    a.aColor.array.set(c.color);
    a.aPart.array.set(c.partId);
    for (const k in a) a[k].needsUpdate = true;
  }

  setVisibleFraction(f) {
    this.geometry.setDrawRange(0, Math.floor(this.count * f));
  }
}
