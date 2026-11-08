import { box, C, cy, cyl, gear, group, lathe, part, prism, repeat, rod, sph, torus, tube, washer } from '../geometry.js';

const HALF_PI = Math.PI / 2;

const blade = (a) => prism([[0.7, -1.4], [4, -2.5], [36, -0.5], [40, -0.15], [40, 0.15], [36, 0.3], [4, 1.4], [0.7, 1.4]], 0.45)
  .rot(HALF_PI, 0, 0).rot(0, 0, a).at(0, 90, 5.2);

const windTurbine = {
  id: 'wind-turbine', name: 'Wind Turbine', blurb: '90 m tower · 80 m rotor · powers about 1,000 homes', view: [0.1, -0.5, 0],
  parts: [
    part('Rotor blades', 'Shaped like wings: wind lift turns them', C.white, group([0, 1, 2].map((i) => blade(HALF_PI + (i * Math.PI * 2) / 3))), [0, 0.1, 0.7]),
    part('Hub', 'Pitches each blade to control the speed', C.gold, lathe([[2.2, 2.8], [2.0, 4.8], [0, 7.5]], { curve: true }).rot(HALF_PI, 0, 0).at(0, 90, 0), [0, 0.15, 0.5]),
    part('Nacelle', 'The housing holding the drivetrain up high', C.grey, group(box(5, 4.4, 11).at(0, 90, -3.6)), [0, 0.65, -0.2]),
    part('Gearbox', 'Steps about 15 rpm up towards generator speed', C.orange, group(gear(1.7, 1.45, 18, 1.8).rot(HALF_PI, 0, 0).at(0, 90, -2.2), gear(1, 0.8, 12, 1.8).rot(HALF_PI, 0, 0).at(0, 90, -4.3)), [0.45, 0.2, 0]),
    part('Generator', 'Turns rotation into electricity', C.red, cyl(1.6, 3.4).rot(HALF_PI, 0, 0).at(0, 90, -7), [-0.45, 0.25, 0]),
    part('Yaw drive', 'Turns the whole head to face the wind', C.violet, washer(2.2, 1.6, 0.7).at(0, 87.4, -1), [0.45, -0.1, 0]),
    part('Tower', 'Steel tube lifting the rotor into stronger wind', C.teal, cy(2.4, 2, 87, 1.5), [-0.6, -0.15, 0]),
    part('Foundation', 'Hundreds of tonnes of concrete stop it toppling', C.brown, cy(9, 0, 2, 2.6), [0, -0.5, 0]),
  ],
};

const watch = {
  id: 'mechanical-watch', name: 'Mechanical Watch', blurb: 'No battery · a wound spring ticks 8 times a second', view: [0.5, 0.25, 0],
  parts: [
    part('Case & bezel', 'Steel shell sealing out dust and water', C.grey, group(washer(1.5, 1.33, 0.46), lathe([[1.5, 0.23], [1.35, 0.3]], { caps: false })), [0, 0, 0.02]),
    part('Crystal', 'Scratch-proof sapphire over the dial', C.cyan, cy(1.33, 0.32, 0.33), [0, 1.0, 0]),
    part('Dial & markers', 'Printed face with twelve hour markers', C.white,
      group(cy(1.3, 0.1, 0.11), repeat(12, (i) => box(0.04, 0.03, 0.17).rot(0, (-i * Math.PI) / 6, 0).at(Math.cos((i * Math.PI) / 6) * 1.12, 0.13, Math.sin((i * Math.PI) / 6) * 1.12))),
      [0, 0.8, 0]),
    part('Hands', 'Driven at three speeds by the motion works', C.gold,
      group(box(0.65, 0.02, 0.06).at(0.32, 0.19, 0).rot(0, 2.3, 0), box(1.0, 0.02, 0.04).at(0.5, 0.21, 0).rot(0, 0.65, 0), box(1.1, 0.015, 0.015).at(0.5, 0.23, 0).rot(0, -1.8, 0), cyl(0.05, 0.08).at(0, 0.21, 0)),
      [0, 0.92, 0]),
    part('Mainspring & barrel', 'A coiled spring that stores the wound energy', C.orange,
      group(washer(0.6, 0.52, 0.16).at(-0.55, 0, 0.3), gear(0.65, 0.58, 30, 0.04).at(-0.55, -0.08, 0.3), tube(Array.from({ length: 38 }, (_, i) => {
        const a = i * 0.65, q = 0.12 + i * 0.0105;
        return [-0.55 + Math.cos(a) * q, 0, 0.3 + Math.sin(a) * q];
      }), 0.008, { sub: 3 })),
      [-0.7, 0.3, 0.25]),
    part('Gear train', 'Carries the spring’s energy to the escapement', C.teal,
      group(gear(0.32, 0.27, 20, 0.04).at(0.15, -0.02, -0.15), gear(0.24, 0.2, 16, 0.04).at(0.58, 0.02, 0.2), gear(0.18, 0.15, 14, 0.04).at(0.25, 0.03, 0.55), cyl(0.025, 0.22).at(0.15, 0, -0.15), cyl(0.02, 0.22).at(0.58, 0, 0.2)),
      [0.45, 0.42, 0.25]),
    part('Escapement', 'Releases one gear tooth at a time: the tick', C.pink,
      group(gear(0.17, 0.13, 15, 0.03).at(0.1, 0.05, -0.65), box(0.42, 0.03, 0.07).at(-0.18, 0.06, -0.6)),
      [0.45, 0.5, -0.5]),
    part('Balance wheel', 'Swings back and forth: the watch’s heartbeat', C.violet,
      group(torus(0.38, 0.03).at(-0.45, 0.1, -0.6), repeat(3, (i) => rod([-0.45, 0.1, -0.6], [-0.45 + Math.cos(i * 2.094) * 0.38, 0.1, -0.6 + Math.sin(i * 2.094) * 0.38], 0.012)), tube(Array.from({ length: 16 }, (_, i) => [-0.45 + Math.cos(i * 0.9) * (0.05 + i * 0.012), 0.13, -0.6 + Math.sin(i * 0.9) * (0.05 + i * 0.012)]), 0.005, { sub: 3 })),
      [-0.35, 0.7, -0.6]),
    part('Crown', 'Winds the spring and sets the time', C.red, group(gear(0.13, 0.11, 18, 0.15).rot(0, 0, HALF_PI).at(1.68, 0, 0), rod([1.45, 0, 0], [1.6, 0, 0], 0.03)), [0.6, 0, 0]),
    part('Strap', 'Leather band that keeps it on your wrist', C.brown, group(box(0.9, 0.05, 2.4).at(0, -0.18, 2.4), box(0.9, 0.05, 2.4).at(0, -0.18, -2.4)), [0, -0.5, 0]),
  ],
};

export const machines = [windTurbine, watch];
