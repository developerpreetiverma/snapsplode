import { anatomy, biology } from './anatomy.js';
import { engines } from './engines.js';
import { machines } from './machines.js';
import { vehicles } from './vehicles.js';
import { wonders } from './wonders.js';

export const CATEGORIES = [
  { id: 'Wonders', items: wonders },
  { id: 'Anatomy', items: anatomy },
  { id: 'Biology', items: biology },
  { id: 'Engines', items: engines },
  { id: 'Vehicles', items: vehicles },
  { id: 'Machines', items: machines },
];

export const ALL_OBJECTS = CATEGORIES.flatMap((c) => c.items.map((item) => ({ ...item, category: c.id })));

// The object `step` places after (or, for -1, before) the given one, running on
// through every category and wrapping around at the ends.
export function stepObject(id, step) {
  const i = ALL_OBJECTS.findIndex((o) => o.id === id);
  return ALL_OBJECTS[(i + step + ALL_OBJECTS.length) % ALL_OBJECTS.length];
}
