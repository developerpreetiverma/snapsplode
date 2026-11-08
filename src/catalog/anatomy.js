import { box, C, cy, cyl, group, lathe, part, prism, repeat, rod, sph, torus, tube, washer } from '../geometry.js';

const HALF_PI = Math.PI / 2;

const heart = {
  id: 'heart', name: 'Human Heart', blurb: 'Fist-sized · about 100,000 beats a day · 4 chambers', view: [0.1, 0.25, 0],
  parts: [
    part('Left ventricle', 'Thick-walled pump sending blood to the whole body', C.crimson, sph(2.0, 2.9, 2.1, { bump: 0.03, freq: 4 }).rot(0, 0, 0.45).at(0.8, -0.8, -0.2), [0.75, -0.3, 0]),
    part('Right ventricle', 'Pushes blood out to the lungs', C.red, sph(2, 2.5, 1.6, { bump: 0.03, freq: 4, phase: 2 }).rot(0, 0, 0.3).at(-1.0, -0.5, 0.75), [-0.7, -0.35, 0.4]),
    part('Left atrium', 'Receives oxygen-rich blood from the lungs', C.orange, sph(1.5, 1.2, 1.4, { bump: 0.05, freq: 5 }).at(1.15, 2.1, -0.6), [0.65, 0.3, -0.35]),
    part('Right atrium', 'Receives used blood from the body', C.blue, sph(1.5, 1.45, 1.3, { bump: 0.05, freq: 5, phase: 1 }).at(-1.65, 1.9, 0.1), [-0.75, 0.3, 0]),
    part('Aorta', 'The body’s largest artery, about as wide as a garden hose', C.pink, group(tube([[0, 1.5, 0.1], [0.05, 3.7, 0.2], [0.4, 5, -0.2], [1.6, 5, -1.1], [2.1, 3.3, -1.6]], 0.72), [[-0.05, -0.3], [0.45, 0], [0.95, 0.3]].map(([x, z]) => tube([[x + 0.5, 5.2, -0.3 + z], [x + 0.6, 6.5, -0.3 + z]], 0.26))), [0.3, 0.75, 0]),
    part('Pulmonary artery', 'Carries oxygen-poor blood to the lungs', C.violet, group(tube([[-0.5, 1.3, 1.1], [-0.2, 3.2, 1.0], [0.1, 3.9, -0.2]], 0.6), tube([[0.1, 3.9, -0.2], [2.4, 4.1, -0.6]], 0.34), tube([[0.1, 3.9, -0.2], [-2.3, 4.0, -0.7]], 0.34)), [-0.25, 0.55, 0.75]),
    part('Vena cava', 'Returns blood from the body to the right atrium', C.cyan, group(cy(0.5, 2.8, 5.5).at(-2, 0, -0.2), cy(0.5, -1.2, 0.9).at(-2.3, 0, -0.5)), [-1.05, 0.45, -0.3]),
    part('Coronary arteries', 'Feed the heart muscle itself', C.gold, group(tube([[-0.1, 2, 1.4], [-0.15, 0.5, 1.9], [0, -1.3, 2.05], [0.5, -2.9, 1.3]], 0.1), tube([[0.5, 1.9, 1.05], [1.6, 0.6, 1.6], [2.2, -0.9, 1.4], [1.9, -2.3, 0.8]], 0.085), tube([[-1, 1.2, 1.2], [-2.3, 0, 1.5], [-2.3, -1.4, 1.1]], 0.085)), [0, 0, 1.0]),
    part('Valves', 'Four one-way flaps; these make the “lub-dub”', C.white, group(washer(0.72, 0.15, 0.12).at(0.4, 0.8, -0.4), washer(0.72, 0.15, 0.12).at(-1.2, 0.8, 0.5), washer(0.5, 0.1, 0.12).at(0.05, 1.5, 0.15), washer(0.5, 0.1, 0.12).at(-0.5, 1.5, 1.1)), [0.05, -1.05, 0.05]),
  ],
};

const brain = {
  id: 'brain', name: 'Human Brain', blurb: 'About 86 billion neurons · 1.4 kg · runs on 20 watts', view: [0.1, -0.85, 0],
  parts: [
    part('Frontal lobe', 'Planning, decisions and personality', C.pink, group(sph(1.95, 2.2, 3, { bump: 0.05, freq: 15, phase: 1 }).at(0, 0.6, 2)), [0, 0.28, 0.85]),
    part('Parietal lobe', 'Combines touch and the sense of space', C.gold, sph(2.05, 2, 2.2, { bump: 0.05, freq: 15, phase: 3 }).at(0, 1.45, -0.3), [0, 0.8, -0.05]),
    part('Temporal lobe', 'Hearing, language and memory', C.teal, group([-1, 1].map((s) => sph(1, 1.2, 2.55, { bump: 0.05, freq: 14, phase: s + 1 }).at(s * 1.35, -0.9, 0.55))), [0, -0.3, 0.55]),
    part('Occipital lobe', 'Where you process what you see', C.violet, sph(1.8, 1.65, 1.65, { bump: 0.05, freq: 15, phase: 2 }).at(0, 0.65, -2.6), [0, 0.2, -0.85]),
    part('Corpus callosum', 'About 200 million fibres link the two halves', C.white, tube([[0, 0.2, 1.5], [0, 0.7, 0.4], [0, 0.65, -1], [0, 0, -1.5]], 0.28), [1.0, 0.1, 0]),
    part('Thalamus', 'Relay station for most incoming senses', C.orange, group(sph(0.48, 0.45, 0.65).at(0.42, -0.25, -0.1), sph(0.48, 0.45, 0.65).at(-0.42, -0.25, -0.1)), [-1.0, 0.0, 0]),
    part('Hippocampus', 'Forms new memories; named after a seahorse', C.red, [-1, 1].map((s) => tube([[s * 0.95, -0.85, 0.45], [s * 1.0, -0.7, -0.45], [s * 0.72, -0.35, -1.2]], [0.28, 0.22, 0.14])), [-1.0, -0.45, 0]),
    part('Cerebellum', 'Fine-tunes balance and movement', C.blue, sph(1.75, 1.05, 1.2, { bump: 0.04, freq: 30 }).at(0, -1.45, -2.3), [0, -0.3, -0.65]),
    part('Brainstem', 'Keeps breathing and heartbeat going', C.green, tube([[0, -0.75, -0.5], [0, -1.8, -0.75], [0, -3.3, -1.15]], [0.56, 0.48, 0.28]), [0, -0.75, 0]),
  ],
};

const lobe = (x, y, z, sx, sy, sz, phase) => sph(sx, sy, sz, { bump: 0.05, freq: 9, phase }).at(x, y, z);
const branch = (s) => group(
  tube([[s * 0.2, 2.1, 0], [s * 1.35, 1.2, 0.05]], [0.26, 0.2]),
  [[2, 2.25, 0.25], [2.5, 0.8, -0.5], [2.3, -0.4, 0.4], [3.1, 0.2, 0.8]].map(([x, y, z]) => tube([[s * 1.35, 1.2, 0.05], [s * x, y, z]], [0.14, 0.05])),
);

const lungs = {
  id: 'lungs', name: 'Lungs', blurb: 'About 300 million air sacs · 11,000 litres of air a day', view: [0.05, 0.4, 0],
  parts: [
    part('Trachea', 'The windpipe, kept open by cartilage rings', C.white, group(cy(0.25, 2.1, 5), repeat(10, (i) => torus(0.28, 0.035).at(0, 2.4 + i * 0.26, 0))), [0, 0.5, 0]),
    part('Right lung: upper lobe', 'The right lung has three lobes', C.pink, lobe(-2.45, 2.2, 0, 1.35, 1.75, 1.75, 1), [-0.55, 0.3, 0]),
    part('Right lung: middle lobe', 'The smallest lobe', C.orange, lobe(-2.65, 0.25, 0.4, 1.2, 1.0, 1.35, 2), [-0.75, 0, 0.25]),
    part('Right lung: lower lobe', 'Largest; does much of the gas exchange', C.red, lobe(-2.55, -1.15, -0.2, 1.5, 1.9, 1.95, 3), [-0.55, -0.35, 0]),
    part('Left lung: upper lobe', 'Notched to make room for the heart', C.violet, lobe(2.55, 1.6, 0, 1.35, 2.2, 1.75, 4), [0.55, 0.3, 0]),
    part('Left lung: lower lobe', 'The left lung has just two lobes', C.teal, lobe(2.7, -1.25, -0.2, 1.35, 1.9, 1.9, 5), [0.55, -0.3, 0]),
    part('Bronchi & bronchioles', 'Branches get finer on the way to the air sacs', C.gold, group(branch(1), branch(-1)), [0, 0.02, 0.95]),
    part('Diaphragm', 'A dome of muscle that powers each breath', C.brown, lathe([[4.6, -3.6], [3.3, -3.1], [1.4, -2.7], [0, -2.6]], { curve: true, caps: false }).scale(1, 1, 0.75), [0, -0.65, 0]),
  ],
};

const eye = {
  id: 'eye', name: 'Human Eye', blurb: '24 mm wide · about 120 million rods · focus changes in a blink', view: [0.1, 0.75, 0],
  parts: [
    part('Sclera', 'Tough white outer coat of the eye', C.white, sph(12), [-0.4, 0.75, -0.2]),
    part('Cornea', 'Clear dome doing about two-thirds of the focusing', C.cyan, sph(7.8, 7.8, 3.2).at(0, 0, 10.2), [0, 0, 1.1]),
    part('Iris', 'Coloured muscle that resizes the pupil', C.blue, washer(5.8, 1.8, 0.3).rot(HALF_PI, 0, 0).at(0, 0, 8.2), [0, 0.5, 0.75]),
    part('Lens', 'Changes shape to focus at different distances', C.gold, sph(4.5, 4.5, 2).at(0, 0, 5.7), [0, -0.55, 0.6]),
    part('Ciliary muscle', 'Pulls on the lens to adjust its shape', C.pink, torus(6, 0.65).rot(HALF_PI, 0, 0).at(0, 0, 5.4), [0.6, 0.15, 0.45]),
    part('Vitreous humour', 'A clear gel filling most of the eyeball', C.violet, sph(9.8).scale(1, 1, 0.92).at(0, 0, -1.8), [0.8, -0.1, 0.05]),
    part('Retina', 'Light-sensing layer lining the back wall', C.red, lathe([[0, -11.4], [6, -9.8], [10, -6.2], [11.3, -1.5], [11, 2]], { curve: true, caps: false }).rot(HALF_PI, 0, 0), [0, -0.1, -0.65]),
    part('Optic nerve', 'Carries a million nerve fibres to the brain', C.orange, tube([[2.2, -0.2, -11.3], [3, -0.3, -16], [4.2, -0.5, -22]], [1.4, 1.5, 1.6]), [0.35, -0.3, -0.95]),
    part('Eye muscles', 'Six muscles move your eyes in every direction', C.green, [[0, 11.2, 0], [0, -11.2, 0], [11.2, 0, 0], [-11.2, 0, 0]].map(([x, y]) => tube([[x * 0.72, y * 0.72, 6.5], [x * 1.05, y * 1.05, -3], [x * 0.22, y * 0.22, -20]], [0.7, 1.3, 0.5])), [0, 0.9, -0.3]),
  ],
};

const ear = {
  id: 'ear', name: 'Human Ear', blurb: 'Hearing and balance · contains the body’s smallest bones', view: [0.1, -0.55, 0],
  parts: [
    part('Outer ear (pinna)', 'Funnels sound and helps locate where it came from', C.pink, group(tube([[-7, 2, 3.5], [-7.3, 4, 2.1], [-7.3, 3.8, -2.2], [-7.1, 0, -3.4], [-6.9, -3, -2.3], [-6.6, -4.3, -0.2], [-6.5, -2.2, 1.6]], [0.5, 0.95, 0.95, 0.9, 0.7, 0.95, 0.5]), sph(0.65, 2.4, 2.2).at(-6.2, 0.4, 0)), [-0.45, 0.1, 0]),
    part('Ear canal', 'A 2.5 cm tube that carries sound inward', C.sand, tube([[-6, 0, 0], [-3, 0.2, 0.1], [0, 0, 0]], 0.7, { curve: false }), [-0.2, -0.3, 0]),
    part('Eardrum', 'A thin membrane vibrating with each sound', C.red, cyl(1.1, 0.08).rot(0, 0, HALF_PI).at(0.05, 0, 0), [0, 0.42, 0]),
    part('Malleus (hammer)', 'First of three tiny bones linked to the eardrum', C.white, group(tube([[0.1, -0.6, 0], [0.5, 0.55, 0], [0.75, 1.2, 0]], [0.09, 0.14, 0.26])), [-0.05, 0.72, 0.2]),
    part('Incus (anvil)', 'Passes vibrations between its two neighbours', C.gold, group(sph(0.32).at(0.95, 1.2, 0), tube([[1.1, 1.1, 0], [1.42, 0.2, 0]], [0.16, 0.06])), [0.05, 0.82, -0.05]),
    part('Stapes (stirrup)', 'The body’s smallest bone, about 3 mm long', C.orange, group(rod([1.45, 0.2, 0.2], [2.2, 0.15, 0.2], 0.05), rod([1.45, 0.2, -0.2], [2.2, 0.15, -0.2], 0.05), cyl(0.27, 0.05).rot(0, 0, HALF_PI).at(2.2, 0.15, 0)), [0.15, 0.72, -0.25]),
    part('Eustachian tube', 'Balances air pressure; your ears “pop” here', C.teal, tube([[0.8, -1, 0.5], [2.2, -2.8, 1.5], [3.6, -4.8, 2.5]], [0.3, 0.26, 0.4]), [0, -0.45, 0.35]),
    part('Cochlea', 'Snail-shaped; hair cells turn sound into signals', C.violet, tube(Array.from({ length: 25 }, (_, i) => {
      const a = i * 0.65, q = 1.5 - i * 0.05;
      return [3.8 + Math.cos(a) * q, -0.9 + Math.sin(a) * q, 0.3 + i * 0.05];
    }), Array.from({ length: 25 }, (_, i) => 0.42 - i * 0.012), { sub: 3 }), [0.45, -0.3, 0.2]),
    part('Semicircular canals', 'Three fluid loops that sense balance', C.blue, group(torus(1.1, 0.13).at(3, 1.5, 0), torus(1.1, 0.13).rot(HALF_PI, 0, 0).at(3, 1.9, 0.7), torus(1.1, 0.13).rot(0, 0, HALF_PI).at(4, 1.6, 0.4)), [0.45, 0.42, 0]),
    part('Auditory nerve', 'Carries hearing and balance signals to the brain', C.gold, group(tube([[4.2, -0.4, 0.9], [6, 0.2, 1.2], [9, 0.4, 1.3]], [0.3, 0.32, 0.45])), [0.75, 0, 0.25]),
  ],
};

const kidney = {
  id: 'kidney', name: 'Kidney', blurb: 'Filters about 180 litres of fluid every day', view: [0.1, -0.1, 0],
  parts: [
    part('Renal capsule & cortex', 'Outer layer with about a million tiny filters', C.brown, group(sph(3.4, 5.6, 2.5, { bump: 0.012, freq: 4 }).at(-1.05, 0, 0)), [-1.05, 0, -0.45]),
    part('Renal pyramids', 'Cone-shaped tissue that concentrates urine', C.crimson, Array.from({ length: 7 }, (_, i) => {
      const a = (i / 6) * 3.1 - 1.55;
      return lathe([[1.1, 0], [0, 2.1]]).rot(0, 0, a + HALF_PI).at(-Math.cos(a) * 3.05 - 0.35, Math.sin(a) * 3.9, 0);
    }), [-0.55, 0, 0.2]),
    part('Renal pelvis', 'A funnel that collects urine from the pyramids', C.gold, group(sph(1.4, 2.1, 0.9).at(0.5, 0, 0), [[-0.4, 2], [-0.8, 0.5], [-0.8, -0.5], [-0.4, -2]].map(([x, y]) => tube([[0.5, y * 0.35, 0], [x, y, 0]], [0.32, 0.22]))), [0.3, 0, 0.85]),
    part('Ureter', 'Carries urine down to the bladder', C.white, tube([[0.9, -0.8, 0], [2.2, -2.6, 0], [2.5, -5.5, 0], [2.4, -9, 0]], [0.5, 0.27, 0.25, 0.25]), [0.45, -0.55, 0.15]),
    part('Renal artery', 'Brings about a fifth of the heart’s output', C.red, tube([[0.3, 0.9, 0.45], [2.6, 1.3, 0.5], [6, 2.2, 0.6]], [0.3, 0.42, 0.55]), [0.65, 0.48, 0.3]),
    part('Renal vein', 'Returns filtered blood to the heart', C.blue, tube([[0.3, -0.2, -0.5], [2.8, 0.1, -0.5], [6, 0.8, -0.6]], [0.32, 0.45, 0.62]), [0.65, -0.05, -0.45]),
    part('Adrenal gland', 'Sits on top; makes adrenaline', C.green, sph(1.8, 0.85, 0.65, { bump: 0.05, freq: 5 }).rot(0, 0, -0.25).at(-1.3, 6, 0), [-0.25, 0.65, 0]),
  ],
};

const tooth = {
  id: 'tooth', name: 'Human Molar', blurb: 'Enamel is the hardest substance in the human body', view: [0.1, 0.6, 0],
  parts: [
    part('Enamel', 'A crown coating over 95% mineral', C.white, group(sph(4.2, 3.5, 4.2).at(0, 4, 0), [[1.8, 1.8], [1.8, -1.8], [-1.8, 1.8], [-1.8, -1.8]].map(([x, z]) => sph(2, 1.5, 2).at(x, 6.5, z))), [0, 0.95, 0.15]),
    part('Dentin', 'Yellowish, sensitive layer beneath the enamel', C.gold, group(sph(3.45, 2.8, 3.45).at(0, 3.7, 0), lathe([[3.3, 0], [3.1, 2.6]], { caps: false })), [0.85, 0.2, 0]),
    part('Pulp chamber', 'The soft living core of the tooth', C.red, sph(1.75, 1.75, 1.75).at(0, 3, 0), [-0.75, 0.3, 0.1]),
    part('Roots', 'Anchor the tooth into the jawbone', C.sand, [[1.5, 0.3], [-1.5, 0.3]].map(([x, tilt]) => lathe([[0.25, -9], [0.95, -5], [1.75, 0.5]], { curve: true, caps: false }).rot(0, 0, Math.sign(x) * 0.12).at(x, 0, 0)), [0, -0.5, -0.1]),
    part('Root canals', 'Channels carrying nerves through each root', C.pink, [[1.5, 1.3], [-1.5, -1.3]].map(([x]) => tube([[x * 0.55, 1.8, 0], [x, -3.5, 0], [x * 1.4, -8, 0]], [0.5, 0.25, 0.08])), [-0.7, -0.35, 0.3]),
    part('Nerves & blood vessels', 'Supply the pulp and let you feel temperature', C.blue, [[-1, 0], [1, 1]].map(([s, p]) => tube([[s * 2.1, -8.8, 0], [s * 2.7, -11, 0.2], [s * 5, -13, p * 0.4]], 0.17)), [0, -0.92, 0.3]),
    part('Periodontal ligament', 'Tiny fibres that cushion each bite', C.green, lathe([[2.0, -8], [3.5, -3], [3.8, 0]], { curve: true, caps: false }), [0.85, -0.55, 0]),
    part('Gum', 'Soft tissue sealing the tooth’s base', C.crimson, washer(5.6, 3.5, 1.2).at(0, 0.5, 0), [0, -0.05, 0.85]),
    part('Jawbone', 'Holds the tooth firm for life', C.grey, washer(6.4, 2.6, 3).at(0, -11.5, 0), [0, -0.3, -0.85]),
  ],
};

const skull = {
  id: 'skull', name: 'Human Skull', blurb: '22 bones · only the jaw moves freely', view: [0.05, 0.55, 0],
  parts: [
    part('Cranium', 'A protective vault around the brain', C.white, sph(7.4, 7.3, 8.8, { bump: 0.01, freq: 4 }).at(0, 2.4, -1.2), [0, 0.7, -0.35]),
    part('Sutures', 'Zigzag joints that lock the skull plates', C.gold, group(tube(Array.from({ length: 26 }, (_, i) => {
      const a = (i / 25) * Math.PI * 1.04 - 0.05;
      return [Math.sin(i * 1.8) * 0.3, 2.4 + Math.sin(a) * 7.42, -1.2 + Math.cos(a) * 8.86];
    }), 0.08, { sub: 2 }), tube(Array.from({ length: 22 }, (_, i) => {
      const a = (i / 21) * Math.PI;
      return [Math.cos(a) * 7.46, 2.4 + Math.sin(a) * 7.34, 1.4 + Math.sin(i * 2) * 0.25];
    }), 0.08, { sub: 2 })), [0, 0.95, -0.35]),
    part('Facial bones', 'Frame your eyes, nose and mouth', C.sand, group(frustum2(), [-1, 1].map((s) => sph(1.95, 1.2, 1.4).at(s * 3.7, -2.75, 5))), [0, 0, 0.6]),
    part('Eye sockets', 'Bony orbits that shield the eyes', C.teal, [-1, 1].map((s) => torus(1.85, 0.34).rot(HALF_PI, 0, 0).at(s * 2.8, -0.4, 7.05)), [0, 0.15, 0.95]),
    part('Nasal cavity', 'Mostly cartilage in life, so the skull shows a hole', C.pink, lathe([[0.95, -3.4], [0.55, -1.5], [0.2, -0.5]], { curve: true, caps: false }).scale(1, 1, 0.55).at(0, 0, 7.2), [0, -0.25, 1.15]),
    part('Upper teeth', 'Fixed into the upper jaw (maxilla)', C.cyan, Array.from({ length: 14 }, (_, i) => {
      const a = ((i - 6.5) / 14) * 2.8;
      return box(0.5, 1, 0.48).rot(0, a, 0).at(Math.sin(a) * 3.4, -5.25, 4.2 + Math.cos(a) * 3);
    }), [0, -0.12, 0.7]),
    part('Lower teeth', 'Set into the only freely moving bone', C.blue, Array.from({ length: 14 }, (_, i) => {
      const a = ((i - 6.5) / 14) * 2.8;
      return box(0.48, 0.95, 0.45).rot(0, a, 0).at(Math.sin(a) * 3.2, -6.45, 4.2 + Math.cos(a) * 2.8);
    }), [0, -0.5, 0.7]),
    part('Mandible', 'The jawbone; has the body’s strongest muscle attached', C.orange, group(tube(Array.from({ length: 9 }, (_, i) => {
      const a = ((i - 4) / 4) * 1.55;
      return [Math.sin(a) * 4.2, -7.4, 3.8 + Math.cos(a) * 3.4];
    }), [0.85, 0.8, 0.7, 0.8, 0.95, 0.8, 0.7, 0.8, 0.85]), [-1, 1].map((s) => rod([s * 4.25, -7.2, 3.6], [s * 5.2, -2.5, 0.6], 0.7))), [0, -0.72, 0.15]),
  ],
};
function frustum2() {
  return lathe([[4.2, -6.2], [5, -3], [5.6, 0.4]], { curve: true, caps: false }).scale(1, 1, 0.52).at(0, 0, 4.4);
}

const limb = (s, a, b, c, ra, rb) => group(rod(a, b, ra), rod(b, c, rb));
const rib = (s, y, i) => tube([[0.6 * s, y + 0.3, -3.5], [8.5 * s - i * 0.25 * s, y - 0.3, -2.2], [9.8 * s - i * 0.25 * s, y - 2, 1.2], [7 * s - i * 0.2 * s, y - 3.8, 4.5], [1.5 * s, y - 3.2 - i * 0.2, 5.3]], 0.33, { sub: 5 });

const skeleton = {
  id: 'skeleton', name: 'Human Skeleton', blurb: '206 adult bones · half of them are in the hands and feet', view: [0.05, 0.45, 0],
  parts: [
    part('Skull', 'Protects the brain', C.white, group(sph(4.6, 5.3, 5.3).at(0, 79, 0), sph(3, 2, 3.2).at(0, 74.5, 1.2)), [0, 0.55, 0]),
    part('Spine', '33 vertebrae, with a natural S-curve', C.gold, repeat(24, (i) => cyl(0.95, 0.75).at(0, 28.5 + i * 1.75, -2 - Math.sin(i * 0.25) * 2)), [0, 0.02, -0.5]),
    part('Rib cage', 'Twelve pairs shielding the heart and lungs', C.pink, repeat(12, (i) => group(rib(1, 67 - i * 2.05, i), rib(-1, 67 - i * 2.05, i))), [0, 0.2, 0.25]),
    part('Sternum', 'The breastbone, where upper ribs meet', C.orange, box(2.1, 13, 0.45).at(0, 56, 5.9), [0, 0.2, 0.7]),
    part('Shoulder girdle', 'Collarbones and shoulder blades', C.teal, group([-1, 1].map((s) => group(rod([s * 1.2, 68.2, 3.5], [s * 11, 69.5, 0], 0.42), prism([[s * 3, 67.5], [s * 10, 67.5], [s * 5, 57]], 0.45).rot(-HALF_PI, 0, 0).at(0, 0, -5)))), [0, 0.35, -0.2]),
    part('Arms', 'Humerus, radius, ulna', C.blue, [-1, 1].map((s) => group(rod([s * 12, 68, 0], [s * 15, 49, 0], 1), rod([s * 15, 49, 0.4], [s * 17, 31, 1.5], 0.55), rod([s * 15, 49, -0.4], [s * 17.8, 31, 0], 0.55))), [0, 0.1, 0.1]),
    part('Hands', '27 bones each: built for precision', C.green, [-1, 1].map((s) => group(box(3.2, 3.6, 0.8).at(s * 17.8, 29, 0.8), repeat(4, (i) => rod([s * (16.5 + i * 0.9), 27, 0.8], [s * (16.3 + i * 1.1), 22, 0.9], 0.2)), rod([s * 16.5, 28.5, 0.8], [s * 14.6, 25, 0.8], 0.22))), [0, -0.15, 0.28]),
    part('Pelvis', 'Bowl-shaped, carrying the upper-body weight', C.violet, group([-1, 1].map((s) => sph(4.8, 4.5, 2).rot(0, s * 0.5, s * 0.25).at(s * 4.6, 28, -0.5)), sph(2, 3, 1).at(0, 26, -3)), [0, -0.02, 0.55]),
    part('Legs', 'The femur is the body’s longest, strongest bone', C.red, [-1, 1].map((s) => group(rod([s * 6, 23.5, 0], [s * 4.8, 10, 0], 1.25), sph(1.6).at(s * 6.6, 24.5, 0), rod([s * 4.7, 9.5, 0.2], [s * 4.3, -9, 0], 0.95), rod([s * 5.8, 9.5, -0.2], [s * 5.4, -9, 0], 0.45))), [0, -0.3, 0]),
    part('Feet', '26 bones each, arched like a spring', C.cyan, [-1, 1].map((s) => group(box(3.6, 1.4, 4.6).at(s * 4.7, -10.5, 0.6), repeat(5, (i) => rod([s * (3.3 + i * 0.7), -11, 2.8], [s * (3.1 + i * 0.85), -11.3, 7], 0.25)))), [0, -0.65, 0.2]),
  ],
};

const knee = {
  id: 'knee', name: 'Knee Joint', blurb: 'The body’s largest joint · loads up to 4× your weight when climbing', view: [0.1, 0.65, 0],
  parts: [
    part('Femur', 'Thigh bone, rounded at its base', C.white, group(lathe([[2, 2.6], [1.7, 6], [1.55, 14]], { curve: true }), [-1, 1].map((s) => sph(1.75, 1.75, 2.05).at(s * 1.7, 1.75, 0))), [0, 0.75, 0]),
    part('Patella', 'Kneecap; levers the muscle for more force', C.gold, sph(1.45, 1.7, 0.6).at(0, 2.6, 3), [0, 0.28, 0.85]),
    part('Quadriceps tendon', 'Connects the thigh muscle to the kneecap', C.teal, tube([[0, 4.2, 2.65], [0, 7.5, 2.1], [0, 11, 1.85]], [0.72, 0.9, 1.15]), [0, 0.6, 0.85]),
    part('Patellar ligament', 'Runs from the kneecap to the shinbone', C.orange, prism([[-0.7, 0], [0.7, 0], [0.55, 3.6], [-0.55, 3.6]], 0.38).rot(-HALF_PI, 0, 0).at(0, -3.2, 2.5).rot(-0.22, 0, 0), [0, -0.2, 0.95]),
    part('Meniscus', 'C-shaped cartilage cushions: the knee’s shock absorber', C.cyan, [-1, 1].map((s) => torus(1.25, 0.26).scale(1, 0.75, 1.15).at(s * 1.8, -0.2, 0)), [0.98, -0.02, 0.1]),
    part('ACL', 'Stops the shin sliding forward; often torn in sport', C.red, rod([0.55, 1.1, -0.1], [-0.3, -0.75, 1], 0.34), [-0.95, 0.18, 0.12]),
    part('PCL', 'Stops the shin sliding backward', C.violet, rod([-0.55, 1, 0.45], [0.2, -0.85, -1.1], 0.38), [-0.95, 0.2, -0.4]),
    part('Collateral ligaments', 'Stop the knee bending sideways', C.green, [-1, 1].map((s) => rod([s * 3.5, 2.4, 0], [s * 3.55, -3.6, 0], 0.3)), [1.0, 0.25, -0.25]),
    part('Tibia', 'Shinbone, carrying most of your weight', C.grey, lathe([[1.45, -14], [1.55, -7], [2.6, -2.5], [3.5, -0.7]], { curve: true }), [0, -0.5, 0]),
    part('Fibula', 'Thin outer bone that helps stabilise the ankle', C.pink, group(rod([3.3, -2.7, -1.3], [2.8, -14, -0.8], 0.45), sph(0.8).at(3.35, -2.4, -1.3)), [0.55, -0.35, -0.2]),
  ],
};

export const anatomy = [heart, brain, lungs, eye, ear, kidney, tooth, skull, skeleton, knee];

const helix = (phase, turns, r, h, n = 90) => Array.from({ length: n }, (_, i) => {
  const t = i / (n - 1);
  const a = t * turns * Math.PI * 2 + phase;
  return [Math.cos(a) * r, (t - 0.5) * h, Math.sin(a) * r];
});

const pairs = (pick) => {
  const list = [];
  const n = 32, turns = 3.2, r = 2.1, h = 22;
  for (let i = 0; i < n; i++) {
    if (i % 2 !== pick) continue;
    const t = i / (n - 1);
    const a = t * turns * Math.PI * 2;
    const y = (t - 0.5) * h;
    list.push(rod([Math.cos(a) * r, y, Math.sin(a) * r], [Math.cos(a + 2.2) * r, y, Math.sin(a + 2.2) * r], 0.22));
  }
  return list;
};

const dna = {
  id: 'dna', name: 'DNA Double Helix', blurb: 'About 2 metres of it in every human cell’s nucleus', view: [0.2, 0.15, -0.15],
  parts: [
    part('Sugar-phosphate backbone A', 'Forms one long strand of the twisting ladder', C.blue, tube(helix(0, 3.2, 2.1, 22), 0.38, { curve: false }), [-0.42, 0, 0]),
    part('Sugar-phosphate backbone B', 'The partner strand, running the opposite way', C.pink, tube(helix(2.2, 3.2, 2.1, 22), 0.38, { curve: false }), [0.42, 0, 0]),
    part('Adenine–thymine pairs', 'Held together by two hydrogen bonds', C.gold, pairs(0), [0, 0.1, 0.45]),
    part('Guanine–cytosine pairs', 'Stronger, with three hydrogen bonds', C.teal, pairs(1), [0, -0.1, -0.45]),
    part('Histone spool', 'Proteins that DNA wraps around for packing', C.violet, group(cyl(2.4, 2.8).at(5.5, -8.6, 0), tube(Array.from({ length: 24 }, (_, i) => [5.5 + Math.cos(i * 0.5) * 2.65, -10 + i * 0.13, Math.sin(i * 0.5) * 2.65]), 0.24)), [0.55, -0.32, 0]),
  ],
};

const mito = (x, y, z, rot) => group(sph(1.5, 0.72, 0.72).rot(0, rot, rot * 0.5).at(x, y, z), repeat(4, (i) => washer(0.6, 0.15, 0.05).rot(0, 0, HALF_PI).at(-0.7 + i * 0.48, 0, 0).rot(0, rot, rot * 0.5).at(x, y, z)));

const cell = {
  id: 'animal-cell', name: 'Animal Cell', blurb: 'A city in miniature · the human body has about 37 trillion', view: [0.2, 0.3, 0],
  parts: [
    part('Cell membrane', 'Flexible barrier controlling what enters or leaves', C.teal, sph(10, 9, 9.5, { bump: 0.012, freq: 5 }), [-1.1, 0.5, -0.5]),
    part('Nucleus', 'Stores the DNA instructions', C.violet, sph(3.7, 3.5, 3.6, { bump: 0.012, freq: 8 }).at(-0.7, 0.4, -0.5), [0, 0.65, 0.25]),
    part('Nucleolus', 'Makes the building blocks of ribosomes', C.pink, sph(1.15, 1.05, 1.1).at(-0.2, 0.3, 0.4), [0, 1.0, 0.75]),
    part('Rough ER', 'Folded membranes studded with ribosomes that make proteins', C.blue, [4.7, 5.5, 6.2].map((r, i) => lathe([[r, -2.6 + i], [r + 0.22, -1 + i * 0.5], [r, 0.6 + i * 0.5], [r + 0.2, 2.3 - i * 0.2]], { curve: true, caps: false }).at(-0.7, 0.3, -0.5)), [-0.65, -0.15, 0.55]),
    part('Golgi apparatus', 'The post office: packs and ships proteins', C.gold, repeat(5, (i) => sph(3.0 - i * 0.2, 0.2, 1.45 - i * 0.1).at(4.6, -4.3 + i * 0.62, 2.1)), [0.8, -0.3, 0.45]),
    part('Mitochondria', 'Power stations that make the cell’s energy', C.orange, group(mito(6, 3, -1.7, 0.4), mito(-5.4, -4.5, 2, -0.7), mito(3.8, -0.2, 5.2, 1.1), mito(-3.4, 5.8, 2.6, 1.8), mito(1, 4.5, -5.5, -1.2)), [0.75, 0.55, 0]),
    part('Lysosomes', 'Recycling bins full of digestive enzymes', C.red, [[3.8, 5.6, 1.5], [-6.5, 2, -3], [1.5, -6.5, -2.6], [6, -3.8, -3.8], [-1.5, -6, 4]].map(([x, y, z]) => sph(0.95).at(x, y, z)), [-0.1, -0.8, 0]),
    part('Centrioles', 'Paired cylinders organising cell division', C.cyan, group(cyl(0.45, 1.8).at(1.5, -4.7, 4), cyl(0.45, 1.8).rot(0, 0, HALF_PI).at(2.2, -4, 4)), [0.75, -0.65, 0.7]),
    part('Free ribosomes', 'Tiny protein factories all through the cytoplasm', C.white, Array.from({ length: 80 }, (_, i) => {
      const a = i * 2.399, y = 1 - (i / 79) * 2, q = Math.sqrt(1 - y * y), r = 5.5 + (i % 5) * 0.7;
      return sph(0.17).at(Math.cos(a) * q * r, y * r * 0.9, Math.sin(a) * q * r);
    }), [-0.75, 0.15, 0.7]),
  ],
};

export const biology = [cell, dna];
