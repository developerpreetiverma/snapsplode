import { box, C, cy, cyl, group, lathe, part, prism, repeat, ringPts, rod, sph, torus, tube, washer } from '../geometry.js';

const HALF_PI = Math.PI / 2;

// Fuselage runs along X, wings along Z.
const airliner = {
  id: 'airliner', name: 'Airliner', blurb: '37.6 m long · 34 m wingspan · 180 seats', view: [0.35, 0.65, -0.12],
  parts: [
    part('Fuselage', 'Pressurised tube with the cabin inside', C.white,
      lathe([[0, -19], [0.75, -18.6], [1.7, -17.3], [2, -15], [2, 10], [1.7, 14], [1, 17], [0.3, 19]], { curve: true }).rot(0, 0, -HALF_PI),
      [0, 0.1, 0.5]),
    part('Cabin & seats', 'Rows of seats for up to 180 passengers', C.violet,
      repeat(30, (i) => group(
        box(0.5, 0.7, 1.25).at(-14 + i * 0.95, -0.55, 1.05),
        box(0.5, 0.7, 1.25).at(-14 + i * 0.95, -0.55, -1.05),
      )),
      [0, 0, 0.02]),
    part('Wings', 'Make the lift; fuel is stored inside', C.teal,
      group(
          prism([[-5, 1.8], [3, 1.8], [-3, 17], [-5.2, 17]], 0.42),
          prism([[-5, -1.8], [3, -1.8], [-3, -17], [-5.2, -17]], 0.42),
      ).at(0.5, -0.9, 0),
      [0, -0.15, 0.25]),
    part('Flaps & ailerons', 'Extend for landing; roll the plane', C.green,
      group(
        prism([[-6.3, 2], [-5.1, 2], [-5.3, 16.6], [-6.1, 16.6]], 0.2),
        prism([[-6.3, -2], [-5.1, -2], [-5.3, -16.6], [-6.1, -16.6]], 0.2),
      ).at(0.5, -0.9, 0),
      [-0.2, -0.28, 0.28]),
    part('Horizontal stabilisers', 'Elevators pitch the nose up and down', C.gold,
      group(
        prism([[-17.5, 0.3], [-13, 0.3], [-16.5, 6.5], [-18, 6.5]], 0.25),
        prism([[-17.5, -0.3], [-13, -0.3], [-16.5, -6.5], [-18, -6.5]], 0.25),
      ).at(0, 0.8, 0),
      [-0.25, 0.32, 0]),
    part('Vertical tail & rudder', 'Keeps it straight; the rudder yaws', C.red,
      prism([[-18.5, 0], [-13, 0], [-17.2, 7], [-19.2, 7]], 0.3).rot(-HALF_PI, 0, 0).at(0, 1.6, 0),
      [-0.2, 0.45, 0]),
    part('Engines (turbofans)', 'Each pushes with about 120 kN of thrust', C.orange,
      group(
        lathe([[0.85, -1.9], [1.1, -1.4], [1.05, 1.4], [0.7, 1.9]], { curve: true }).rot(0, 0, -HALF_PI).at(1.4, -2, 5.8),
        lathe([[0.85, -1.9], [1.1, -1.4], [1.05, 1.4], [0.7, 1.9]], { curve: true }).rot(0, 0, -HALF_PI).at(1.4, -2, -5.8),
      ),
      [0.1, -0.55, 0]),
    part('Landing gear', 'Folds up into the belly after take-off', C.blue,
      group(
        rod([9, -2, 0], [9, -3.7, 0], 0.11), cyl(0.38, 0.28).rot(HALF_PI, 0, 0).at(9, -3.9, 0),
        rod([-1, -2, 3], [-1, -3.7, 3], 0.14), cyl(0.5, 0.42).rot(HALF_PI, 0, 0).at(-1, -3.9, 3),
        rod([-1, -2, -3], [-1, -3.7, -3], 0.14), cyl(0.5, 0.42).rot(HALF_PI, 0, 0).at(-1, -3.9, -3),
      ),
      [0, -0.72, -0.1]),
  ],
};

const saturnV = {
  id: 'saturn-v', name: 'Saturn V Rocket', blurb: '110 m · 3 stages · took Apollo to the Moon', view: [0.1, 0.5, 0],
  parts: [
    part('Launch escape tower', 'Could pull the crew clear in an emergency', C.red,
      group(cy(0.18, 100, 106), cy(0.5, 97, 100, 0.18), cy(0.18, 106, 110, 0.03))),
    part('Command module', 'Crew cabin; the only part that came home', C.white, cy(1.95, 93.5, 97, 0.5)),
    part('Service module', 'Main engine, power and life support', C.grey,
      group(cy(1.95, 86, 93.5), cy(0.9, 84.6, 86, 0.3))),
    part('Lunar module', 'Landed two astronauts on the Moon', C.gold,
      group(box(2.6, 2.2, 2.6).at(0, 78, 0), repeat(4, (i) => {
        const a = ((i + 0.5) * Math.PI) / 2;
        return rod([0, 77.5, 0], [Math.cos(a) * 2.6, 74.8, Math.sin(a) * 2.6], 0.09);
      }))),
    part('Spacecraft adapter', 'Tapered shroud that protected the lander', C.cyan, lathe([[3.3, 74], [1.95, 86]], { caps: false })),
    part('Instrument unit', 'The computer that guided the rocket', C.pink, cy(3.3, 72.8, 74)),
    part('Third stage (S-IVB)', 'One J-2 engine; sent Apollo towards the Moon', C.violet,
      group(cy(3.3, 57, 72.8), cy(5, 53, 57, 3.3))),
    part('Second stage (S-II)', 'Five J-2 engines burning liquid hydrogen', C.blue, cy(5, 28, 53)),
    part('First stage (S-IC)', 'Burned about 13 tonnes of fuel per second', C.white,
      group(cy(5, 7, 28), repeat(4, (i) => {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        return prism([[0, 0], [3.2, 0], [3.2, 2], [0, 5]], 0.3).rot(-HALF_PI, -a, 0).at(Math.cos(a) * 5, 2, Math.sin(a) * 5);
      }))),
    part('F-1 engines', 'Most powerful single-nozzle engines ever flown', C.orange,
      group(cy(1.8, 0, 7, 0.65).at(0, 0, 0), ringPts(3.4, 4, 0, Math.PI / 4).map(([x, , z]) => cy(1.8, 0, 7, 0.65).at(x, 0, z)))),
  ],
};

const carWheel = (x, z) => group(
  torus(0.3, 0.13).rot(HALF_PI, 0, 0).at(x, 0.36, z),
  repeat(5, (i) => rod([x, 0.36, z], [x + Math.cos(i * 1.257) * 0.26, 0.36 + Math.sin(i * 1.257) * 0.26, z], 0.025)),
);

const sportsCar = {
  id: 'sports-car', name: 'Sports Car', blurb: 'Mid-engined · 2 seats · built for grip and balance', view: [0.3, -0.75, 0],
  parts: [
    part('Body shell', 'Carbon panels shaped to press the car down', C.red,
      prism([[-2.25, 0.25], [2.2, 0.25], [2.25, 0.62], [1.1, 0.82], [-1.2, 0.92], [-2.2, 1.08], [-2.3, 0.65]], 1.8).rot(-HALF_PI, 0, 0).at(0, 0, 0),
      [0, 0.35, 0]),
    part('Cabin glass', 'Curved windscreen and a low, wide canopy', C.cyan,
      prism([[-0.95, 0.85], [1.05, 0.82], [0.25, 1.27], [-0.55, 1.28]], 1.42).rot(-HALF_PI, 0, 0),
      [0, 0.68, 0]),
    part('Wheels & tyres', 'Wide tyres put the power on the road', C.grey,
      group(carWheel(1.4, 0.92), carWheel(1.4, -0.92), carWheel(-1.4, 0.92), carWheel(-1.4, -0.92)),
      [0, -0.2, 0]),
    part('Brake discs', 'Turn speed into heat, fast', C.orange,
      group([[1.4, 0.8], [1.4, -0.8], [-1.4, 0.8], [-1.4, -0.8]].map(([x, z]) => washer(0.2, 0.07, 0.035).rot(HALF_PI, 0, 0).at(x, 0.36, z))),
      [0, -0.4, 0]),
    part('Mid-mounted engine', 'Sits behind the seats for better balance', C.gold,
      group(box(1.0, 0.45, 0.8).at(-1.15, 0.55, 0), repeat(6, (i) => cyl(0.1, 0.22).at(-1.5 + i * 0.14, 0.86, i % 2 ? 0.2 : -0.2))),
      [-0.25, 0.25, 0.65]),
    part('Seats', 'Low and deep to hold you through corners', C.violet,
      group([0.38, -0.38].map((z) => group(box(0.5, 0.1, 0.48).at(-0.05, 0.42, z), box(0.12, 0.6, 0.48).at(-0.33, 0.7, z)))),
      [0.08, 0.4, -0.65]),
    part('Rear wing', 'Adds downforce at high speed', C.teal,
      group(box(0.32, 0.04, 1.6).at(-2.1, 1.38, 0), rod([-2.1, 1.0, 0.45], [-2.1, 1.36, 0.45], 0.03), rod([-2.1, 1.0, -0.45], [-2.1, 1.36, -0.45], 0.03)),
      [-0.35, 0.55, 0]),
    part('Exhaust', 'Carries burned gases out of the back', C.pink,
      group([0.3, -0.3].map((z) => rod([-1.5, 0.45, z], [-2.42, 0.45, z], 0.075))),
      [-0.6, -0.1, 0]),
    part('Headlights', 'LED units set into the nose', C.white,
      group([0.62, -0.62].map((z) => sph(0.12, 0.05, 0.2).at(2.05, 0.68, z))),
      [0.5, 0.15, 0]),
  ],
};

const bikeWheel = (x) => group(
  torus(0.56, 0.08).rot(HALF_PI, 0, 0).at(x, 0.64, 0),
  repeat(7, (i) => {
    const a = (i / 7) * Math.PI * 2;
    return rod([x, 0.64, 0], [x + Math.cos(a) * 0.5, 0.64 + Math.sin(a) * 0.5, 0], 0.016);
  }),
);

const motorcycle = {
  id: 'motorcycle', name: 'Motorcycle', blurb: 'Two wheels · about 200 kg · leans into every corner', view: [0.15, -0.6, 0],
  parts: [
    part('Frame', 'The steel spine everything bolts onto', C.teal,
      group(rod([0.82, 1.28, 0], [-0.05, 1.28, 0], 0.035), rod([0.82, 1.18, 0], [0.1, 0.45, 0], 0.035), rod([-0.05, 1.28, 0], [-0.3, 0.55, 0], 0.035), rod([0.1, 0.45, 0], [-0.3, 0.55, 0], 0.035), rod([-0.05, 1.25, 0], [-0.8, 1.15, 0], 0.025)),
      [0, 0.05, 0.28]),
    part('Engine', 'Twin cylinders turn fuel into motion', C.orange,
      group(box(0.52, 0.32, 0.3).at(0.08, 0.62, 0), cy(0.11, 0.78, 1.08).at(0.0, 0, 0), cy(0.11, 0.78, 1.08).rot(0, 0, -0.5).at(-0.25, -0.05, 0), repeat(5, (i) => washer(0.145, 0.1, 0.018).at(0, 0.84 + i * 0.05, 0))),
      [0.06, -0.15, -0.55]),
    part('Fuel tank', 'Holds about 16 litres above the engine', C.red,
      sph(0.36, 0.17, 0.17).at(0.34, 1.3, 0),
      [0.1, 0.6, 0]),
    part('Seat', 'Long, flat saddle for rider and passenger', C.violet,
      sph(0.42, 0.065, 0.14).at(-0.36, 1.27, 0),
      [-0.2, 0.55, 0]),
    part('Front fork', 'Telescopic tubes soak up the bumps', C.grey,
      group(rod([0.86, 1.32, 0.09], [1.28, 0.64, 0.09], 0.025), rod([0.86, 1.32, -0.09], [1.28, 0.64, -0.09], 0.025)),
      [0.3, 0.2, 0.3]),
    part('Rear swingarm & shock', 'Lets the back wheel follow the road', C.blue,
      group(rod([-0.25, 0.55, 0.07], [-1.28, 0.64, 0.07], 0.025), rod([-0.25, 0.55, -0.07], [-1.28, 0.64, -0.07], 0.025), rod([-0.6, 1.15, 0.09], [-0.9, 0.62, 0.09], 0.03)),
      [-0.3, -0.1, 0.35]),
    part('Wheels', 'Spoked rims with grippy rounded tyres', C.white,
      group(bikeWheel(1.28), bikeWheel(-1.28)),
      [0, -0.35, 0]),
    part('Handlebars', 'Steer, throttle, clutch and front brake', C.gold,
      group(rod([0.86, 1.48, -0.38], [0.86, 1.48, 0.38], 0.02), rod([0.86, 1.32, 0], [0.86, 1.48, 0], 0.025), sph(0.09).at(1.0, 1.32, 0)),
      [0.32, 0.55, 0]),
    part('Exhaust', 'Quietens and carries away hot gases', C.pink,
      tube([[0.1, 0.95, 0.15], [0.4, 0.5, 0.18], [0, 0.32, 0.2], [-0.6, 0.42, 0.2], [-1.1, 0.62, 0.2]], [0.035, 0.04, 0.04, 0.05, 0.075]),
      [-0.05, -0.4, 0.6]),
  ],
};

export const vehicles = [sportsCar, motorcycle, airliner, saturnV];
