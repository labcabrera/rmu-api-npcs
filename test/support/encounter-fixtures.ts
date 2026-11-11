import type {
  EncounterCodes,
  EncounterDifferential,
  EncounterEntry,
  EncounterRow,
  EncounterSettings,
  EncounterTable,
} from '../../src/modules/encounters/domain/value-objects/encounter-table.vo.js';

// Synthetic encounter tables (spec 061): made-up ids, ranges and creatures. The book rows live only in data/ and in
// Mongo, never in this public repo.

const row = (min: number, max: number, entry: EncounterEntry, condition: EncounterRow['condition'] = null): EncounterRow => ({
  min,
  max,
  um66: false,
  condition,
  entry,
});

const um66: EncounterRow = { min: null, max: null, um66: true, condition: null, entry: { type: 'special' } };

export const TEST_TABLES: EncounterTable[] = [
  {
    id: 'test-plains',
    biome: 'Q',
    kind: 'biome',
    roll: 'open',
    subtables: [
      {
        min: 1,
        max: 100,
        rows: [
          row(1, 20, { type: 'redirect', tableId: 'test-universal-animals', bonus: 0 }),
          um66,
          row(21, 50, { type: 'npc', npcIds: ['cl1-test-wolf'], label: 'Test wolf' }),
          row(51, 60, { type: 'npc', npcIds: ['cl1-test-fish'], label: 'Test fish' }, 'water'),
          row(61, 100, { type: 'npc', npcIds: ['cl1-test-hare'], label: 'Test hare' }),
          row(101, 200, { type: 'redirect', tableId: 'test-universal-monsters', bonus: 100 }),
          row(201, 300, { type: 'npc', npcIds: ['cl1-test-drake-young', 'cl1-test-drake-old'], label: 'Test drake' }),
        ],
      },
    ],
    source: { book: 'test-book', page: 1 },
  },
  {
    id: 'test-woods',
    biome: 'W',
    kind: 'biome',
    roll: 'open',
    subtables: [
      {
        min: 1,
        max: 50,
        rows: [
          row(1, 150, { type: 'npc', npcIds: ['cl1-test-deer'], label: 'Test deer' }),
          row(151, 300, { type: 'npc', npcIds: ['cl1-test-bear'], label: 'Test bear' }),
        ],
      },
      { min: 51, max: 100, rows: [row(1, 300, { type: 'event', key: 'test-storm', label: 'Test storm' })] },
    ],
    source: null,
  },
  {
    id: 'test-ruins',
    biome: 'Z',
    kind: 'location',
    roll: 'open',
    subtables: [
      {
        min: 1,
        max: 100,
        rows: [row(1, 100, { type: 'redirect', tableId: null, bonus: 0 }), row(101, 300, { type: 'text', label: 'Test ghost' })],
      },
    ],
    source: null,
  },
  {
    id: 'test-universal-animals',
    biome: null,
    kind: 'universal',
    roll: 'straight',
    subtables: [
      {
        min: 1,
        max: 100,
        rows: [
          row(1, 50, { type: 'npc', npcIds: ['cl1-test-rabbit'], label: 'Test rabbit' }),
          um66,
          row(51, 100, { type: 'npc', npcIds: ['cl1-test-goat'], label: 'Test goat' }, 'land'),
        ],
      },
    ],
    source: null,
  },
  {
    id: 'test-universal-monsters',
    biome: null,
    kind: 'universal',
    roll: 'open',
    subtables: [
      {
        min: 1,
        max: 300,
        rows: [
          row(1, 200, { type: 'npc', npcIds: ['cl1-test-troll'], label: 'Test troll' }),
          row(201, 300, { type: 'race', raceId: 'test-race', label: 'Test race' }),
        ],
      },
    ],
    source: null,
  },
];

const none: EncounterCodes = [null, null];
const differential = (min: number, max: number | null, light: EncounterCodes): EncounterDifferential => ({
  min,
  max,
  dense: ['a', 'a'],
  moderate: ['h', 'h'],
  light,
  uninhabited: [null, 's'],
  waste: none,
});

export const TEST_SETTINGS: EncounterSettings = {
  id: 'creature-law-1',
  modifiers: [
    { key: 'test-group-solo', side: 'avoidance', group: 'test-group', value: 50 },
    { key: 'test-group-large', side: 'avoidance', group: 'test-group', value: -20 },
    { key: 'test-stealth', side: 'avoidance', group: null, value: null },
    { key: 'test-terrain-rough', side: 'activity', group: 'test-terrain', value: 10 },
    { key: 'test-terrain-open', side: 'activity', group: 'test-terrain', value: 40 },
    { key: 'test-hostile', side: 'activity', group: null, value: 25 },
  ],
  differentials: [
    differential(1, 50, none),
    differential(51, 90, ['s', null]),
    differential(91, 100, ['b', 's']),
    differential(101, null, ['t', 'a']),
  ],
  specials: [
    { key: 'test-wild', tableIds: ['test-plains', 'test-woods'] },
    { key: 'test-tame', tableIds: ['test-universal-animals'] },
  ],
};

export const tableLookup = (id: string) => TEST_TABLES.find(table => table.id === id);

/** The documents as the data script stores them, with `_id`. */
export const tableDocuments = () => TEST_TABLES.map(({ id, ...table }) => ({ _id: id, ...table }));
export const settingsDocument = () => {
  const { id, ...settings } = TEST_SETTINGS;
  return { _id: id, ...settings };
};
