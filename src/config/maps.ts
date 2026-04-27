export type MapCategory = 'fixed' | 'rotation';

export type CsMap = {
  name: string;
  category: MapCategory;
  type: 'workshop' | 'valve';
  workshopId?: string;
  valveMap?: string;
};

export const ROTATION_MAP_COUNT = 3;

export const MAP_POOL: CsMap[] = [
  // FIXOS - Workshop
  { name: 'Bind', category: 'fixed', type: 'workshop', workshopId: '3252270444' },
  { name: 'Haven', category: 'fixed', type: 'workshop', workshopId: '3150232493' },
  { name: 'Insertion2', category: 'fixed', type: 'workshop', workshopId: '3236615060' },
  { name: 'The Rats', category: 'fixed', type: 'workshop', workshopId: '3161693626' },
  { name: 'Aztec', category: 'fixed', type: 'workshop', workshopId: '3079692971' },
  { name: 'Chateau', category: 'fixed', type: 'workshop', workshopId: '3242539047' },
  { name: 'Cobblestone', category: 'fixed', type: 'workshop', workshopId: '3329387648' },

  // FIXOS - Valve
  { name: 'Train', category: 'fixed', type: 'valve', valveMap: 'de_train' },
  { name: 'Vertigo', category: 'fixed', type: 'valve', valveMap: 'de_vertigo' },

  // FIXO sem link por enquanto
  { name: 'Warden', category: 'fixed', type: 'workshop', workshopId: 'de_warden' },

  // ROTATIVOS - Workshop
  { name: 'Season', category: 'rotation', type: 'workshop', workshopId: '3073892687' },
  { name: 'Tuscan', category: 'rotation', type: 'workshop', workshopId: '3267671493' },
  { name: 'Splinter', category: 'rotation', type: 'workshop', workshopId: '3691046714' },
  { name: 'Fachwerk', category: 'rotation', type: 'workshop', workshopId: '3442040035' },
  { name: 'Echolab', category: 'rotation', type: 'workshop', workshopId: '3531149465' },
  { name: 'The Rats Room', category: 'rotation', type: 'workshop', workshopId: '3565920324' },
  { name: 'Neptune', category: 'rotation', type: 'workshop', workshopId: '3430103877' },
  { name: 'Ascent', category: 'rotation', type: 'workshop', workshopId: '3492821243' },
  { name: 'Boulder', category: 'rotation', type: 'workshop', workshopId: '3663186989' },
  { name: 'Vegas', category: 'rotation', type: 'workshop', workshopId: '3605045961' },
  { name: 'Survivor', category: 'rotation', type: 'workshop', workshopId: '3077457651' },
  { name: 'Havana', category: 'rotation', type: 'workshop', workshopId: '3592633696' },
  { name: 'Piranesi', category: 'rotation', type: 'workshop', workshopId: '3607096360' },
];