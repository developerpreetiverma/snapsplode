import { box, C, cy, cyl, frustum, group, lathe, mesh, part, prism, repeat, ringPts, rod, sph, torus, tube, washer } from '../geometry.js';

const HALF_PI = Math.PI / 2;

const lattice = (a, b, c, d, steps, r) => repeat(steps, (i) => {
  const lerp = (p, q, t) => p.map((v, k) => v + (q[k] - v) * t);
  const t0 = i / steps, t1 = (i + 1) / steps;
  return group(
    rod(lerp(a, b, t0), lerp(c, d, t1), r),
    rod(lerp(c, d, t0), lerp(a, b, t1), r),
  );
});

const eiffelLeg = (sx, sz) => {
  const foot = [sx * 62, 0, sz * 62];
  const top = [sx * 28, 57, sz * 28];
  const up = [sx * 19, 115, sz * 19];
  return group(
    tube([foot, top, up], [12, 7, 4.5], { curve: false }),
    lattice(foot, top, [foot[0], 0, foot[2] - sz * 22], [top[0], 57, top[2] - sz * 10], 6, 0.9),
  );
};

const eiffel = {
  id: 'eiffel', name: 'Eiffel Tower', blurb: 'Paris · 330 m tall · 18,000 iron parts · built by 1889', view: [0.05, 0.75, 0],
  parts: [
    part('Base legs', 'Four curved legs set on masonry piers', C.brown,
      [eiffelLeg(1, 1), eiffelLeg(-1, 1), eiffelLeg(1, -1), eiffelLeg(-1, -1)], [0, -0.25, 0]),
    part('Base arches', 'Decorative; the legs carry the load', C.gold,
      [0, 1, 2, 3].map((i) => tube(Array.from({ length: 9 }, (_, k) => {
        const t = k / 8, x = -44 + t * 88;
        return [x, 31 + 22 * (1 - (x / 44) ** 2), 0];
      }), 1.2).at(0, 0, 40).rot(0, (i * Math.PI) / 2, 0)), [0, -0.05, 0]),
    part('First floor', 'At 57 m, with a glass floor', C.teal, frustum(92, 88, 54, 60), [0.35, 0.03, 0]),
    part('Second floor', 'At 115 m, the best view of the city', C.blue, frustum(44, 40, 112, 118), [-0.35, 0.12, 0]),
    part('Upper pillars', 'The legs merge into one narrowing tower', C.violet,
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([x, z]) => tube([[x * 18, 118, z * 18], [x * 9, 200, z * 9], [x * 4, 270, z * 4]], [3.2, 2, 1.2], { curve: false })), [0, 0.3, 0]),
    part('Lattice bracing', 'Open ironwork lets the wind pass through', C.white,
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([x, z]) => lattice([x * 18, 118, z * 18], [x * 4, 270, z * 4], [x * 18, 118, -z * 18], [x * 4, 270, -z * 4], 16, 0.42)), [0, 0.42, 0]),
    part('Top platform', 'At 276 m, with Gustave Eiffel’s small apartment', C.red, frustum(16, 14, 270, 280), [0.25, 0.62, 0]),
    part('Summit antennas', 'Added later; they brought it to 330 m', C.pink, group(cy(4, 280, 298, 1.4), cy(0.7, 298, 330)), [0, 0.85, 0]),
  ],
};

const pyramidTiers = (n, base, h) => repeat(n, (i) => {
  const t = i / n;
  return frustum(base * (1 - t) * 0.96, base * (1 - (i + 1) / n) * 0.96, t * h * 0.96, ((i + 1) / n) * h * 0.96);
});

const pyramid = {
  id: 'great-pyramid', name: 'Great Pyramid of Giza', blurb: 'Egypt · 2.3 million blocks · tallest structure for 3,800 years', view: [0.25, 0.55, 0],
  parts: [
    part('Casing stones', 'Polished white limestone, mostly gone today', C.white,
      mesh([
        [[-115, 0, -115], [0, 138, 0], [115, 0, -115]], [[115, 0, -115], [0, 138, 0], [115, 0, 115]],
        [[115, 0, 115], [0, 138, 0], [-115, 0, 115]], [[-115, 0, 115], [0, 138, 0], [-115, 0, -115]],
      ]), [0, 0.9, 0.5]),
    part('Core masonry', 'Stepped tiers of rough limestone blocks', C.sand, pyramidTiers(12, 215, 128), [0, 0, -0.7]),
    part('King’s Chamber', 'Lined with granite, holding a stone sarcophagus', C.red, box(10.5, 5.8, 5.2).at(0, 44, 0), [0.75, 0.4, 0.3]),
    part('Relieving chambers', 'Five stacked voids take weight off the roof', C.orange, repeat(5, (i) => box(10.5, 1, 5).at(0, 49.5 + i * 2.6, 0)), [0.75, 0.75, 0.3]),
    part('Queen’s Chamber', 'Smaller room at the pyramid’s centre', C.violet, box(5.7, 6, 5.2).at(0, 23, 0), [-0.75, 0.35, 0.3]),
    part('Grand Gallery', 'Soaring corbelled corridor, 47 m long', C.gold, box(2.1, 8.5, 47).rot(0.45, 0, 0).at(0, 32, 22), [0, 0.45, 0.75]),
    part('Descending passage', 'Original entrance, sloping into the bedrock', C.teal, box(1.1, 1.2, 105).rot(-0.46, 0, 0).at(0, 2, 40), [0, -0.3, 0.85]),
    part('Subterranean chamber', 'Unfinished room cut beneath the pyramid', C.blue, box(14, 3.5, 8).at(0, -24, 0), [0, -0.55, 0.2]),
  ],
};

const dome = (r, y, tip = 0.55) => lathe([[r * 0.8, y], [r, y + r * 0.35], [r * 1.05, y + r * 0.75], [r * 0.7, y + r * 1.25], [r * 0.2, y + r * 1.6], [0, y + r * (1.6 + tip)]], { curve: true });

const taj = {
  id: 'taj-mahal', name: 'Taj Mahal', blurb: 'Agra · white marble mausoleum · completed around 1653', view: [0.2, 0.55, 0],
  parts: [
    part('Great dome', 'Onion-shaped marble dome about 35 m high', C.white, group(dome(17, 42), cy(16, 36, 43)), [0, 0.65, 0]),
    part('Finial', 'A gilded spire crowning the main dome', C.gold, group(cy(1, 75, 84, 0.25), sph(1.4).at(0, 76, 0)), [0, 0.92, 0]),
    part('Chattris', 'Four small domed pavilions around the main dome', C.pink, [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([x, z]) => group(dome(4.5, 42), cy(4, 36, 42)).at(x * 16, 0, z * 16)), [0, 0.42, 0.4]),
    part('Mausoleum', 'Holds the cenotaphs of Mumtaz Mahal and Shah Jahan', C.sand, group(frustum(56, 56, 7, 36), [1, -1].map((s) => box(18, 22, 1).at(0, 19, s * 28.2)), [1, -1].map((s) => box(1, 22, 18).at(s * 28.2, 19, 0))), [0, 0.2, 0]),
    part('Marble plinth', 'Raised square platform lifting it off the ground', C.grey, frustum(95, 95, 0, 7), [0, -0.3, 0]),
    part('Minarets', 'Four towers, built leaning slightly outward', C.teal, [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([x, z]) => group(cy(3, 7, 45, 2.2), torus(2.8, 0.4).at(0, 20, 0), torus(2.5, 0.4).at(0, 33, 0), dome(3, 45)).at(x * 42, 0, z * 42)), [0, 0.12, 0]),
    part('Reflecting pool', 'Long water channel on the garden’s axis', C.cyan, box(10, 0.4, 60).at(0, 0, 82), [0, -0.4, 0.3]),
  ],
};

const ringWall = (rx, rz, y0, y1, n, pillar) => repeat(n, (i) => {
  const a = (i / n) * Math.PI * 2;
  return box(pillar, y1 - y0, pillar).rot(0, -a, 0).at(Math.cos(a) * rx, (y0 + y1) / 2, Math.sin(a) * rz);
});

const colosseum = {
  id: 'colosseum', name: 'Colosseum', blurb: 'Rome · 50,000 spectators · opened in 80 CE', view: [0.5, 0.5, 0],
  parts: [
    part('Outer arcades', '80 arches per ring, in three stacked orders', C.sand, group(ringWall(94, 78, 0, 11, 80, 2.8), ringWall(94, 78, 13, 24, 80, 2.8), ringWall(94, 78, 26, 37, 80, 2.8), [12, 25].map((y) => lathe([[93, y - 1], [95, y - 1], [95, y + 1], [93, y + 1]], { caps: false }).scale(1, 1, 78 / 94))), [0, 0.5, 0.75]),
    part('Attic wall', 'Top storey that held the awning masts', C.white, lathe([[94, 37], [95, 37], [95, 48], [94, 48]], { caps: false }).scale(1, 1, 78 / 94), [0, 0.95, 0.75]),
    part('Seating tiers', 'Seats by status: senators closest to the action', C.brown, repeat(5, (i) => lathe([[50 + i * 8.5, 8 + i * 5.5], [58.5 + i * 8.5, 8 + i * 5.5], [58.5 + i * 8.5, 13.5 + i * 5.5]], { caps: false }).scale(1, 1, 0.83)), [0, 0.35, -0.2]),
    part('Vaults & corridors', 'Barrel vaults moved crowds out within minutes', C.grey, group(ringWall(68, 56, 0, 9, 40, 2.4), ringWall(78, 65, 0, 18, 40, 2.4)), [0, -0.1, -0.7]),
    part('Arena floor', 'Wooden deck covered with sand', C.gold, cy(44, 7.8, 8).scale(1, 1, 0.65), [0, 0.2, 0]),
    part('Hypogeum', 'Underground tunnels and lifts for animals', C.red, group(repeat(8, (i) => box(66, 6, 1.5).at(0, 3, -20 + i * 5.7)), repeat(3, (i) => box(1.5, 6, 42).at(-20 + i * 20, 3, 0))), [0, -0.5, 0]),
    part('Awning masts', 'Sailors rigged a shade called the velarium', C.teal, ringPts(95, 40, 48).map(([x, y, z]) => rod([x, y, z * (78 / 94)], [x, y + 10, z * (78 / 94)], 0.4)), [0, 1.2, 0.75]),
  ],
};

const wallPath = [[-180, 12, -60], [-120, 24, -25], [-60, 18, 25], [-5, 30, 15], [50, 44, -35], [120, 36, -25], [180, 52, 30]];
const wallBoxes = (w, h, y, step = 2) => {
  const pts = [];
  for (let i = 0; i < wallPath.length - 1; i++) {
    const [a, b] = [wallPath[i], wallPath[i + 1]];
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / step);
    const yaw = -Math.atan2(b[2] - a[2], b[0] - a[0]);
    for (let k = 0; k < n; k++) {
      const t = k / n;
      pts.push(box(step + 0.5, h, w).rot(0, yaw, 0).at(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + y, a[2] + (b[2] - a[2]) * t));
    }
  }
  return group(pts);
};

const greatWall = {
  id: 'great-wall', name: 'Great Wall of China', blurb: 'Over 21,000 km of walls · built across about 2,000 years', view: [0.45, 0.2, 0],
  parts: [
    part('Mountain ridge', 'The wall follows ridgelines as natural defence', C.green, wallPath.slice(0, -1).map((a, i) => {
      const b = wallPath[i + 1];
      const yaw = -Math.atan2(b[2] - a[2], b[0] - a[0]);
      const len = Math.hypot(b[0] - a[0], b[2] - a[2]) + 25;
      return frustumAt(a, b, yaw, len);
    }), [0, -0.55, 0]),
    part('Wall body', 'Packed earth and rubble faced with stone or brick', C.sand, wallBoxes(7, 8, 4), [0, 0, -0.1]),
    part('Walkway', 'About 4 m wide, enough for five horses abreast', C.white, wallBoxes(5.4, 0.5, 8.3), [0, 0.28, 0]),
    part('Battlements', 'Notched parapets gave archers cover', C.orange, group(wallBoxes(0.7, 2, 9.5, 4).at(0, 0, 3), wallBoxes(0.7, 2, 9.5, 4).at(0, 0, -3)), [0, 0.5, 0]),
    part('Watchtowers', 'Smoke and fire signals crossed hundreds of km', C.red, wallPath.map(([x, y, z]) => group(box(15, 20, 15).at(x, y + 10, z), frustum(17, 13, y + 20, y + 25).at(x, 0, z))), [0, 0.72, 0]),
  ],
};
function frustumAt(a, b, yaw, len) {
  return frustum(len, len * 0.8, -40, 0, 80, 20).rot(0, yaw, 0).at((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
}

const stone = (w, h, d, phase = 0) => sph(w / 2, h / 2, d / 2, { bump: 0.05, freq: 5, phase }).scale(1.05);

const stonehenge = {
  id: 'stonehenge', name: 'Stonehenge', blurb: 'England · raised about 2500 BCE · aligned with the solstice', view: [0.5, 0.55, 0],
  parts: [
    part('Sarsen circle', 'Thirty upright stones, about 4 m tall', C.grey, ringPts(16, 30).map(([x, , z], i) => box(2.1, 4.1, 1.1).rot(0, -(i / 30) * Math.PI * 2, 0).at(x, 2.05, z)), [0, -0.05, 0.6]),
    part('Lintels', 'Top stones locked on with woodworking joints', C.white, ringPts(16, 30, 0, Math.PI / 30).map(([x, , z], i) => box(3.2, 0.8, 1).rot(0, -((i + 0.5) / 30) * Math.PI * 2, 0).at(x, 4.5, z)), [0, 0.55, 0.6]),
    part('Trilithons', 'Five giant arches; the tallest is over 7 m', C.sand, [0.1, 0.9, 1.57, 2.25, 3.05].map((a, i) => {
      const r = 8.6, x = Math.cos(a + Math.PI) * r, z = Math.sin(a + Math.PI) * r * 0.82, h = 5.8 + (i === 2 ? 1.5 : Math.abs(i - 2) === 1 ? 0.5 : 0);
      return group(box(1.9, h, 1).at(-1.25, h / 2, 0), box(1.9, h, 1).at(1.25, h / 2, 0), box(4.5, 0.9, 1).at(0, h + 0.45, 0)).rot(0, -a + HALF_PI, 0).at(x, 0, z);
    }), [0, 0.3, -0.6]),
    part('Bluestones', 'Hauled about 240 km from the Preseli Hills in Wales', C.blue, group(ringPts(12, 32).map(([x, , z], i) => box(0.9, 1.9, 0.6).rot(0, i, 0).at(x, 0.95, z))), [0.75, -0.2, 0]),
    part('Altar Stone', 'Sandstone from far northern Scotland', C.red, box(4.8, 0.5, 1).at(0, 0.25, -3), [0, 0.65, 0]),
    part('Heel Stone', 'Marks the midsummer sunrise from the centre', C.orange, stone(2.5, 4.9, 2.1, 1).at(0, 2.4, 25), [0, 0.2, 0.3]),
    part('Earth bank & ditch', 'The monument’s earliest phase, dug with antler picks', C.green, washer(27, 23, 0.6).at(0, -0.3, 0), [0, -0.55, 0]),
  ],
};

const chichen = {
  id: 'chichen-itza', name: 'Chichén Itzá', blurb: 'Mexico · 365 steps · a serpent of shadow at the equinox', view: [0.3, 0.6, 0],
  parts: [
    part('Nine terraces', 'One for each of the nine levels of the Maya underworld', C.sand, repeat(9, (i) => frustum(55.3 - i * 4.8, 54 - i * 4.8, i * 2.65, (i + 1) * 2.65)), [0, -0.1, 0]),
    part('North staircase', 'Its serpent heads meet the shadow at the equinox', C.red, repeat(18, (i) => box(8.8, 1.3, 2.4).at(0, i * 1.32 + 0.6, 28 - i * 1.25)), [0, 0.1, 0.65]),
    part('South staircase', 'Each stair has 91 steps; with the top, 365', C.gold, repeat(18, (i) => box(8.8, 1.3, 2.4).at(0, i * 1.32 + 0.6, -(28 - i * 1.25))), [0, 0.1, -0.65]),
    part('East staircase', 'Stairs on all four sides make a sun calendar', C.teal, repeat(18, (i) => box(2.4, 1.3, 8.8).at(28 - i * 1.25, i * 1.32 + 0.6, 0)), [0.65, 0.1, 0]),
    part('West staircase', 'Priests climbed these for public ceremonies', C.blue, repeat(18, (i) => box(2.4, 1.3, 8.8).at(-(28 - i * 1.25), i * 1.32 + 0.6, 0)), [-0.65, 0.1, 0]),
    part('Serpent heads', 'Kukulkan’s stone heads guard the base', C.green, [-1, 1].map((s) => box(2.5, 2.8, 4).at(s * 5.4, 1.4, 29.5)), [0, -0.15, 0.95]),
    part('Summit temple', 'Dedicated to the feathered serpent Kukulkan', C.white, frustum(13.5, 12.5, 24, 30), [0, 0.5, 0]),
    part('Inner pyramid', 'An older temple is hidden inside', C.violet, frustum(32, 8, 0, 21), [0, 0.8, 0.0]),
  ],
};

const terrace = (r, y, h, q = 0.62) => lathe([[r, y], [r, y + h], [r - 5, y + h]], { caps: false }).scale(1, 1, q);

const machuPicchu = {
  id: 'machu-picchu', name: 'Machu Picchu', blurb: 'Peru · built around 1450 · sits 2,430 m above sea level', view: [0.4, 0.5, 0],
  parts: [
    part('Huayna Picchu', 'The steep peak that towers behind the citadel', C.green, lathe([[62, 0], [46, 48], [24, 96], [6, 132], [0, 136]], { curve: true }).scale(1, 1, 0.75).at(30, 0, -135), [0.1, 0.25, -0.5]),
    part('Mountain saddle', 'The citadel sits on a ridge between two peaks', C.teal, lathe([[150, -22], [125, 12], [84, 30], [70, 32]], { curve: true }).scale(1, 1, 0.68), [0, -0.6, 0]),
    part('Farming terraces', 'Layered soil stopped landslides and drained rain', C.gold, repeat(9, (i) => terrace(92 + i * 7, 30 - i * 4.2, 3.6).at(-52, 0, 40)), [-0.55, -0.1, 0.2]),
    part('Central plaza', 'Open green that split the city in two', C.white, cy(28, 32, 33).scale(1.4, 1, 0.7), [0, 0.32, 0]),
    part('Temple of the Sun', 'Curved wall; a window frames the solstice sun', C.orange, group(lathe([[9, 33], [9, 44], [8, 44]], { caps: false }), cy(9, 44, 45.5, 3)).at(-32, 0, 10), [-0.2, 0.68, 0.1]),
    part('Intihuatana stone', 'A carved pillar thought to track the sun', C.red, group(frustum(13, 9, 33, 43), box(2, 5, 2).at(0, 45.5, 0)).at(35, 0, -18), [0.45, 0.65, 0]),
    part('Stone houses', 'About 200 buildings of precisely fitted granite', C.grey, Array.from({ length: 16 }, (_, i) => {
      const x = -60 + (i % 8) * 16, z = i < 8 ? 34 : -44;
      return group(box(10, 6, 7).at(x, 36, z), mesh([[[x - 5, 39, z - 3.5], [x + 5, 39, z - 3.5], [x, 44, z]], [[x + 5, 39, z + 3.5], [x - 5, 39, z + 3.5], [x, 44, z]]]));
    }), [0, 0.42, 0.45]),
  ],
};

const christ = {
  id: 'christ-redeemer', name: 'Christ the Redeemer', blurb: 'Rio de Janeiro · 30 m statue · 28 m arm span', view: [0.05, 0.5, 0],
  parts: [
    part('Corcovado summit', 'A 700 m granite peak above the city', C.green, lathe([[15, 0], [10.5, 3], [8, 7], [7, 10]], { curve: true }), [0, -0.5, 0]),
    part('Pedestal', 'An 8 m base containing a small chapel', C.grey, frustum(9, 7.4, 10, 18), [0, -0.28, 0]),
    part('Robes', 'Reinforced concrete under soapstone tiles', C.white, lathe([[4, 18], [3.4, 24], [3.0, 31], [3.1, 38], [2.7, 41]], { curve: true }), [0.15, -0.02, 0.3]),
    part('Torso & shoulders', 'The frame bears the weight of the arms', C.sand, group(sph(3.3, 4.2, 2.3).at(0, 41, 0), sph(3.9, 1.5, 2).at(0, 43.5, 0)), [-0.1, 0.15, -0.15]),
    part('Outstretched arms', 'Spanning 28 m, a symbol of peace', C.teal, [-1, 1].map((s) => tube([[s * 3, 44, 0], [s * 8, 44.3, 0], [s * 13.8, 44.4, 0]], [1.45, 1.05, 0.7], { curve: false })), [0, 0.28, 0]),
    part('Hands', 'Each one about 3.2 m long', C.gold, [-1, 1].map((s) => sph(1.1, 0.8, 0.35).at(s * 14.5, 44.3, 0)), [0, 0.4, 0]),
    part('Head', 'Sculpted by Gheorghe Leonida, 3.75 m tall', C.orange, group(sph(1.4, 1.85, 1.5).at(0, 47.2, 0), cyl(0.95, 1.5).at(0, 45.2, 0)), [0, 0.55, 0]),
  ],
};

const petra = {
  id: 'petra', name: 'Petra: Al-Khazneh', blurb: 'Jordan · carved directly into rose sandstone', view: [0.15, 0.4, 0],
  parts: [
    part('Cliff face', 'Living rock: the facade was carved from the top down', C.brown, group(box(46, 54, 2).at(0, 25, -7.5), box(8, 54, 12).at(-27, 25, -2), box(8, 54, 12).at(27, 25, -2)), [0, 0, -0.75]),
    part('Lower columns', 'Six Corinthian columns on the ground floor', C.pink, [-11.5, -7, -2.3, 2.3, 7, 11.5].map((x) => group(cy(1, 0, 13), cy(1.25, 13, 14.5, 1.5)).at(x, 0, 1)), [0, -0.2, 0.3]),
    part('Grand entablature', 'Carved frieze above the lower columns', C.sand, group(box(29, 2.4, 3.5).at(0, 15.7, 0.5)), [0, 0, 0.55]),
    part('Pediment', 'The triangular gable over the portico', C.gold, prism([[-8.5, 0], [8.5, 0], [0, 4.5]], 2.5).rot(-HALF_PI, 0, 0).at(0, 17, 0.5), [0, 0.15, 0.8]),
    part('Tholos', 'A round pavilion between two half-gables', C.teal, group(cy(4.5, 20, 30), lathe([[4.8, 30], [3, 32], [0.8, 33]]), [-1, 1].map((s) => box(6, 10, 3).at(s * 11, 25, 0))), [0, 0.38, 0.65]),
    part('Stone urn', 'Bedouin legend said pirate treasure hid inside', C.red, group(sph(1.1, 1.5, 1.1).at(0, 35, 0), cyl(0.4, 1).at(0, 33.3, 0)), [0, 0.65, 0.5]),
    part('Doorway', 'The entrance to a royal tomb chamber', C.violet, box(4.8, 9, 1).at(0, 4.5, -3.5), [0, -0.45, 0.65]),
    part('Inner chamber', 'A plain square hall behind the ornate front', C.blue, box(13, 12, 12).at(0, 6, -12), [0, -0.35, -1.0]),
  ],
};

const liberty = {
  id: 'statue-of-liberty', name: 'Statue of Liberty', blurb: 'New York · copper skin · 93 m to the torch', view: [0.05, 0.55, 0],
  parts: [
    part('Fort Wood', 'An 11-point star fort from the 1800s', C.sand, prism(Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2, r = i % 2 ? 26 : 37;
      return [Math.cos(a) * r, Math.sin(a) * r];
    }), 8).at(0, 4, 0), [0, -0.45, 0]),
    part('Pedestal', 'Paid for by public donations in the US', C.white, group(frustum(25, 15, 8, 32), frustum(17, 12, 32, 45)), [0, -0.25, 0]),
    part('Copper robes', 'Thin as two pennies, hung over an iron frame', C.green, lathe([[9, 45], [7.5, 58], [6.3, 72], [5.8, 80]], { curve: true }), [0.1, -0.02, 0.25]),
    part('Eiffel’s iron frame', 'Gustave Eiffel designed the flexible skeleton', C.red, group(rod([0, 45, 0], [0, 86, 0], 1.3), repeat(10, (i) => {
      const y = 46 + i * 4;
      return group(rod([4, y, 4], [-4, y + 4, -4], 0.2), rod([-4, y, 4], [4, y + 4, -4], 0.2));
    })), [-0.45, 0.05, 0]),
    part('Raised arm', 'The arm alone stands about 13 m', C.teal, tube([[4.2, 80, 0], [6.5, 92, 0], [7.5, 105, 0]], [2.4, 1.6, 1.15], { curve: false }), [0.25, 0.25, 0]),
    part('Torch', 'A gold-leaf flame; the original is in the museum', C.gold, group(cy(1.8, 105, 107, 2.8), sph(1.6, 3, 1.6).at(0, 110, 0)).at(7.5, 0, 0), [0.25, 0.55, 0]),
    part('Tablet', 'Inscribed with the date July 4, 1776', C.orange, box(1, 8, 4.7).rot(0, 0, 0.2).at(-6.5, 76, 0), [-0.4, 0.05, 0]),
    part('Head', 'Modelled on a stern classical face', C.blue, group(sph(3, 3.9, 3.2).at(0, 86, 0), cyl(1.8, 3).at(0, 81.6, 0)), [0, 0.42, 0]),
    part('Seven-ray crown', 'Rays for the seven seas and continents', C.pink, [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9].map((a) => rod([Math.sin(a) * 3, 89, Math.cos(a) * 3], [Math.sin(a) * 9, 93, Math.cos(a) * 8], 0.35)), [0, 0.62, 0]),
  ],
};

export const wonders = [eiffel, pyramid, taj, colosseum, greatWall, stonehenge, chichen, machuPicchu, christ, petra, liberty];
