// The encounter tables of Creature Law, chapter 15 (spec 061). The rows are book data, imported by the data script
// into `encounter-tables` and `encounter-settings`: this API only reads them.

export const ENCOUNTER_TABLE_KINDS = ['biome', 'location', 'universal'] as const;
export type EncounterTableKind = (typeof ENCOUNTER_TABLE_KINDS)[number];

/** `open`: an open-ended d100 against rows 01-300. `straight`: a d100 against rows 01-100, never modified. */
export const ENCOUNTER_ROLL_TYPES = ['open', 'straight'] as const;
export type EncounterRollType = (typeof ENCOUNTER_ROLL_TYPES)[number];

export const ENCOUNTER_CONDITIONS = ['water', 'land'] as const;
export type EncounterCondition = (typeof ENCOUNTER_CONDITIONS)[number];

export const ENCOUNTER_ENTRY_TYPES = ['npc', 'redirect', 'race', 'event', 'text', 'special'] as const;
export type EncounterEntryType = (typeof ENCOUNTER_ENTRY_TYPES)[number];

export type EncounterNpcEntry = { type: 'npc'; npcIds: string[]; label: string };
/** `tableId: null` is "Roll on Biome Table": the region table of the request. */
export type EncounterRedirectEntry = { type: 'redirect'; tableId: string | null; bonus: number };
export type EncounterRaceEntry = { type: 'race'; raceId: string | null; label: string };
export type EncounterEventEntry = { type: 'event'; key: string; label: string };
export type EncounterTextEntry = { type: 'text'; label: string };
export type EncounterSpecialEntry = { type: 'special' };

export type EncounterEntry =
  EncounterNpcEntry | EncounterRedirectEntry | EncounterRaceEntry | EncounterEventEntry | EncounterTextEntry | EncounterSpecialEntry;

/** A row of a table. The UM 66 row has no range (`min` and `max` null) and `um66: true`. */
export type EncounterRow = {
  min: number | null;
  max: number | null;
  um66: boolean;
  condition: EncounterCondition | null;
  entry: EncounterEntry;
};

/** The d100 range that picks the subtable; one subtable 1-100 when the table is not split. */
export type EncounterSubtable = { min: number; max: number; rows: EncounterRow[] };

export type EncounterTableSource = { book: string; page: number | null };

export type EncounterTable = {
  id: string;
  /** Code of Table T-3.1g, null for the universal tables. */
  biome: string | null;
  kind: EncounterTableKind;
  roll: EncounterRollType;
  subtables: EncounterSubtable[];
  source: EncounterTableSource | null;
};

export type EncounterTableSummary = Omit<EncounterTable, 'subtables' | 'source'> & { subtables: { min: number; max: number }[] };

export const POPULATIONS = ['dense', 'moderate', 'light', 'uninhabited', 'waste'] as const;
export type Population = (typeof POPULATIONS)[number];

export const MODIFIER_SIDES = ['avoidance', 'activity'] as const;
export type ModifierSide = (typeof MODIFIER_SIDES)[number];

/** A modifier of Table 15.4a. `group`: the options of a group are exclusive; `value: null`: entered by the GM. */
export type EncounterModifier = { key: string; side: ModifierSide; group: string | null; value: number | null };

/** Codes of Table 15.4b: `[social, creature]`, null is "--". */
export type EncounterCodes = [string | null, string | null];

/** A row of Table 15.4b; the last one has `max: null` (201+). */
export type EncounterDifferential = { min: number; max: number | null } & Record<Population, EncounterCodes>;

/** A special situation of Table 15.4c and the tables it applies to. */
export type EncounterSpecial = { key: string; tableIds: string[] };

export const ENCOUNTER_SETTINGS_ID = 'creature-law-1';

export type EncounterSettings = {
  id: string;
  modifiers: EncounterModifier[];
  differentials: EncounterDifferential[];
  specials: EncounterSpecial[];
};
