import { box, C, cy, cyl, gear, group, lathe, part, prism, repeat, ringPts, rod, sph, torus, tube, washer } from '../geometry.js';

const HALF_PI = Math.PI / 2;

const bladeRow = (R, y, n, inner = 0.15, h = 0.2) => repeat(n, (i) => {
  const a = (i / n) * Math.PI * 2;
  return prism([[inner, -h / 2], [R, -h / 3], [R, h / 3], [inner, h / 2]], 0.015).rot(0, -a, 0).at(0, y, 0);
});

// Airflow runs from the top of Y (front) down; the view lays it on its side.
const turbofan = {
  id: 'turbofan', name: 'Turbofan Jet Engine', blurb: 'Most of the thrust comes from air that skips the core', view: [0.25, 0.6, HALF_PI],
  parts: [
    part('Fan & spinner', 'Giant blades push most of the air around the core', C.teal,
      group(bladeRow(1.05, 2.7, 22, 0.25, 0.35), lathe([[0.3, 2.45], [0.24, 2.9], [0, 3.2]], { curve: true, caps: false })),
      [0, 0.7, 0]),
    part('Nacelle', 'The smooth outer casing that guides the airflow', C.white,
      lathe([[0.85, -1.2], [1.13, 1.2], [1.2, 2.6], [1.1, 3.1]], { curve: true, caps: false }),
      [0, 0, 1.15]),
    part('Low-pressure compressor', 'First squeeze of the air entering the core', C.blue,
      group([2.2, 1.95, 1.7].map((y) => bladeRow(0.5, y, 16, 0.18, 0.14))),
      [0, 0.32, 0]),
    part('High-pressure compressor', 'Squeezes air to about 40 times outside pressure', C.violet,
      group([1.4, 1.2, 1.0, 0.8, 0.6, 0.4].map((y, i) => bladeRow(0.42 - i * 0.03, y, 14, 0.14, 0.1))),
      [0, 0.12, 0]),
    part('Combustor', 'Fuel burns continuously at over 1,500 °C', C.red,
      lathe([[0.3, -0.25], [0.37, 0], [0.37, 0.2], [0.26, 0.3]], { curve: true }),
      [0.42, 0, 0]),
    part('Turbines', 'Hot gas spins them; they drive the fan and compressors', C.orange,
      group([-0.45, -0.65, -0.85, -1.05].map((y, i) => bladeRow(0.34 + i * 0.05, y, 16, 0.12, 0.1))),
      [0, -0.2, 0]),
    part('Main shaft', 'Links each turbine to the parts it drives', C.gold, cyl(0.07, 3.8).at(0, 0.8, 0), [-0.5, 0, 0]),
    part('Exhaust nozzle', 'Accelerates the hot core gas out of the back', C.grey,
      lathe([[0.1, -2], [0.38, -1.25], [0.5, -1.1]], { caps: false }),
      [0, -0.65, 0]),
  ],
};

const v8Bank = (side) => {
  const tilt = side * 0.78;
  return Array.from({ length: 4 }, (_, i) => {
    const z = -0.75 + i * 0.5;
    return { x: Math.sin(tilt), y: Math.cos(tilt), z, tilt };
  });
};
const banks = [...v8Bank(1), ...v8Bank(-1)];

const v8 = {
  id: 'v8', name: 'V8 Car Engine', blurb: 'Eight cylinders in a V · four power strokes per crank turn', view: [0.3, 0.55, 0],
  parts: [
    part('Engine block', 'Cast housing holding the cylinders and coolant', C.grey,
      group(box(1.5, 0.8, 2.4).at(0, 0.05, 0), prism([[-0.75, -1.2], [0.75, -1.2], [1.25, -1.2], [1.25, 1.2], [-1.25, 1.2], [-1.25, -1.2]], 0.2).at(0, 0.48, 0)),
      [0.75, 0, 0.3]),
    part('Pistons', 'Pushed down by each burst of burning fuel', C.gold,
      group(banks.map((b) => cyl(0.19, 0.28).rot(0, 0, -b.tilt).at(b.x * 0.75, b.y * 0.75, b.z))),
      [-0.1, 0.5, 0]),
    part('Connecting rods', 'Turn the up-and-down push into rotation', C.violet,
      group(banks.map((b) => rod([b.x * 0.75, b.y * 0.75, b.z], [0, -0.1, b.z], 0.035))),
      [-0.65, 0.05, 0]),
    part('Crankshaft', 'The output: spins at up to about 7,000 rpm', C.red,
      group(cyl(0.08, 2.9).rot(HALF_PI, 0, 0).at(0, -0.1, 0), [-0.75, -0.25, 0.25, 0.75].map((z, i) => box(0.16, 0.42, 0.09).at(0, i % 2 ? 0.04 : -0.24, z))),
      [0, -0.75, 0]),
    part('Cylinder heads', 'Hold the valves and spark plugs above each bank', C.teal,
      group([1, -1].map((s) => box(0.72, 0.28, 2.3).rot(0, 0, -s * 0.78).at(s * 0.95, 1.14, 0))),
      [0, 0.72, 0.75]),
    part('Intake manifold', 'Shares incoming air between the eight cylinders', C.blue,
      group(box(0.5, 0.26, 2.0).at(0, 1.2, 0), banks.map((b) => rod([0, 1.2, b.z], [b.x * 1.12, b.y * 1.4, b.z], 0.05))),
      [0, 1.05, 0]),
    part('Timing gears', 'Keep valves in step with the pistons', C.orange,
      group(gear(0.4, 0.34, 26, 0.06).rot(HALF_PI, 0, 0).at(0, -0.1, 1.48), gear(0.26, 0.21, 18, 0.06).rot(HALF_PI, 0, 0).at(0, 0.55, 1.48)),
      [0, 0, 0.8]),
    part('Oil pan', 'Oil reservoir that keeps moving parts slippery', C.pink,
      box(1.1, 0.34, 2.3).at(0, -0.72, 0),
      [0, -1.15, 0]),
  ],
};

const driver = (x) => group(
  torus(0.6, 0.05).rot(HALF_PI, 0, 0).at(x, 0.65, 0.85),
  torus(0.6, 0.05).rot(HALF_PI, 0, 0).at(x, 0.65, -0.85),
  repeat(10, (i) => {
    const a = (i / 10) * Math.PI * 2;
    return group(rod([x, 0.65, 0.85], [x + Math.cos(a) * 0.58, 0.65 + Math.sin(a) * 0.58, 0.85], 0.022), rod([x, 0.65, -0.85], [x + Math.cos(a) * 0.58, 0.65 + Math.sin(a) * 0.58, -0.85], 0.022));
  }),
  cyl(0.05, 1.7).rot(HALF_PI, 0, 0).at(x, 0.65, 0),
);

const steam = {
  id: 'steam-engine', name: 'Steam Locomotive', blurb: 'Fire boils water · steam pushes pistons · rods turn wheels', view: [0.2, -0.65, 0],
  parts: [
    part('Boiler', 'Long drum of water heated by tubes of hot gas', C.teal, cyl(0.68, 3.2).rot(0, 0, HALF_PI).at(0.6, 1.8, 0), [0, 0.5, 0]),
    part('Smokebox & chimney', 'Exhaust steam drags the fire’s draught upward', C.grey,
      group(cyl(0.7, 0.5).rot(0, 0, HALF_PI).at(2.45, 1.8, 0), lathe([[0.16, 2.45], [0.2, 2.9], [0.27, 3.05]]).at(2.4, 0, 0)),
      [0.55, 0.3, 0]),
    part('Steam dome', 'Collects the driest steam from the top of the boiler', C.gold, group(cy(0.22, 2.45, 2.65), sph(0.22).at(0, 2.65, 0)).at(0.9, 0, 0), [0, 0.95, 0]),
    part('Firebox', 'Burns coal to make the heat', C.red, box(1.1, 1.3, 1.25).at(-1.5, 1.5, 0), [-0.25, -0.1, 0.7]),
    part('Cylinders & pistons', 'Steam pressure pushes the piston back and forth', C.violet,
      group([1, -1].map((s) => cyl(0.26, 0.9).rot(0, 0, HALF_PI).at(2.1, 0.95, s * 1.02))),
      [0.45, -0.1, 0.7]),
    part('Driving wheels', 'Turned by the rods; grip comes from their weight', C.white, group(driver(1.05), driver(-0.3)), [0, -0.45, 0]),
    part('Connecting rods', 'Change the piston’s push into wheel rotation', C.orange,
      group([1, -1].map((s) => group(rod([2.1, 0.95, s * 1.02], [1.05, 0.95, s * 1.02], 0.04), rod([1.05, 0.95, s * 1.02], [-0.3, 0.95, s * 1.02], 0.04)))),
      [0, -0.65, 0.75]),
    part('Cab', 'Where the driver and fireman work', C.blue, group(box(1.15, 1.25, 1.75).at(-2.65, 2.25, 0), box(1.45, 0.08, 2.0).at(-2.65, 2.92, 0)), [-0.55, 0.5, 0]),
    part('Frame & buffers', 'Rigid chassis carrying everything', C.pink, group(box(6, 0.16, 1.5).at(0, 0.85, 0), box(0.12, 0.45, 1.8).at(3.0, 0.9, 0)), [0, -0.25, -0.7]),
  ],
};

const f1 = {
  id: 'f1-engine', name: 'F-1 Rocket Engine', blurb: 'Saturn V’s first-stage engine · about 6.7 MN of thrust', view: [0.1, 0.6, 0],
  parts: [
    part('Gimbal & thrust mount', 'Swivels to steer the whole rocket', C.gold, group(sph(0.3).at(0, 5.6, 0), cy(0.5, 5, 5.3, 0.2)), [0, 0.65, 0]),
    part('Injector plate', 'Sprays fuel and oxidiser together through thousands of holes', C.pink, cy(1.0, 4.65, 4.95, 0.85), [0, 0.42, 0]),
    part('Combustion chamber', 'Fuel burns at about 3,300 °C here', C.red, lathe([[0.55, 3.0], [0.72, 3.25], [1.0, 3.9], [1.0, 4.65]], { curve: true, caps: false }), [0, 0.2, 0]),
    part('Nozzle bell', 'Expands the hot gas into thrust', C.white, lathe([[1.85, 0], [1.25, 1.2], [0.82, 2.2], [0.55, 3.0]], { curve: true, caps: false }), [0, -0.1, 0]),
    part('Nozzle extension', 'Turbine exhaust cools its inner wall', C.grey, lathe([[2.6, -2.6], [2.2, -1.3], [1.85, 0]], { curve: true, caps: false }), [0, -0.45, 0]),
    part('Turbopump', '55,000 hp turbine feeding propellant to the chamber', C.orange,
      group(cy(0.5, 2.3, 4.4).at(1.65, 0, 0), sph(0.55, 0.32, 0.55).at(1.65, 2.9, 0), gear(0.5, 0.42, 16, 0.14).at(1.65, 2.4, 0)),
      [0.7, 0.1, 0.1]),
    part('Propellant lines', 'Big pipes carrying kerosene and liquid oxygen', C.blue,
      group(tube([[1.65, 3.9, 0], [0.9, 5.0, 0.4], [0.15, 5.05, 0.8]], 0.17), tube([[1.55, 3.3, 0.5], [0.8, 4.2, 1.2], [0, 4.3, 1.05]], 0.15)),
      [0.1, 0.42, 0.65]),
    part('Hypergolic cartridge', 'A chemical slug that lit the engine on contact', C.green, group(cy(0.13, 4.3, 5.0).at(-1.1, 0, 0.1), rod([-1.1, 4.3, 0.1], [-0.5, 4.2, 0.1], 0.05)), [-0.7, 0.15, 0]),
    part('Heat exchanger', 'Boiled oxygen to pressurise the rocket’s tank', C.violet, torus(0.5, 0.11).at(1.65, 1.9, 0), [0.6, -0.25, -0.25]),
  ],
};

export const engines = [turbofan, v8, steam, f1];
