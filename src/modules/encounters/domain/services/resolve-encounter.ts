import { DomainError, NotFoundError, ValidationError } from '../../../shared/domain/errors/errors.js';
import type {
  EncounterCondition,
  EncounterEntry,
  EncounterRollType,
  EncounterRow,
  EncounterSettings,
  EncounterSubtable,
  EncounterTable,
  ModifierSide,
  Population,
} from '../value-objects/encounter-table.vo.js';

// Resolution of an encounter (spec 061, Creature Law 15.4). Pure and stateless: the front sends every roll made so
// far, and the answer says what the rolls give and which roll is still missing.

export type EncounterModifierChoice = { key: string; value?: number | null };
export type EncounterSideRoll = { roll: number; modifiers?: EncounterModifierChoice[] };

export type ResolveEncounterRequest = {
  check?: { population: Population; avoidance: EncounterSideRoll; activity: EncounterSideRoll } | null;
  tableId: string;
  /** For "Roll on Biome Table"; defaults to `tableId` when that is a biome table. */
  regionTableId?: string | null;
  water?: boolean | null;
  land?: boolean | null;
  /** GM bonus to the open creature rolls, kept on redirects. */
  creatureModifier?: number | null;
  /** Subtable d100s and creature rolls, in the order they are used. */
  rolls?: number[];
  /** The unmodified dice of the same rolls, for the UM 66 check. */
  unmodified?: (number | null)[] | null;
};

export type EncounterCheckResult = {
  avoidance: number;
  activity: number;
  differential: number;
  encounter: boolean;
  social: string | null;
  creature: string | null;
};

export type EncounterPathStep = {
  tableId: string;
  subtable: { min: number; max: number };
  /** The d100 that picked the subtable, null when the table is not split. */
  subtableRoll: number | null;
  roll: number;
  adjustedRoll: number;
  row: { min: number | null; max: number | null };
  clamped: 'low' | 'high' | null;
};

export type EncounterNextStep = { step: 'subtable' | 'creature'; tableId: string; roll: EncounterRollType; bonus: number };

export type EncounterResult = {
  entry: EncounterEntry;
  um66: boolean;
  special: { key: string } | null;
  conditionUnmet: EncounterCondition | null;
};

export type ResolveEncounterResponse = {
  check: EncounterCheckResult | null;
  path: EncounterPathStep[];
  next: EncounterNextStep | null;
  result: EncounterResult | null;
};

export type EncounterTableLookup = (id: string) => EncounterTable | undefined;

/** Tables walked at most in one resolution: a biome, its region and two universals leave room to spare. */
export const MAX_ENCOUNTER_DEPTH = 5;

const INVALID_MODIFIER = 'invalid-encounter-modifier';
const INVALID_REQUEST = 'invalid-encounter-request';

export function resolveEncounter(
  request: ResolveEncounterRequest,
  lookup: EncounterTableLookup,
  settings: EncounterSettings,
): ResolveEncounterResponse {
  const first = findTable(lookup, request.tableId);
  const region = regionTable(request, first, lookup);
  const check = request.check ? resolveCheck(request.check, settings) : null;
  if (check && !check.encounter) return { check, path: [], next: null, result: null };

  const rolls = request.rolls ?? [];
  const creatureModifier = request.creatureModifier ?? 0;
  const path: EncounterPathStep[] = [];
  let index = 0;
  let table = first;
  let bonus = 0;

  for (;;) {
    let subtable = table.subtables[0];
    let subtableRoll: number | null = null;
    if (table.subtables.length > 1) {
      if (index >= rolls.length)
        return { check, path, next: { step: 'subtable', tableId: table.id, roll: 'straight', bonus: 0 }, result: null };
      subtableRoll = rolls[index++];
      subtable = pickSubtable(table.subtables, subtableRoll);
    }
    if (index >= rolls.length) return { check, path, next: { step: 'creature', tableId: table.id, roll: table.roll, bonus }, result: null };

    const roll = rolls[index];
    const unmodified = request.unmodified?.[index];
    index++;
    const modifier = table.roll === 'open' ? creatureModifier + bonus : 0;
    const adjustedRoll = roll + modifier;
    const um66 = unmodified !== undefined && unmodified !== null ? unmodified === 66 : modifier === 0 && roll === 66;
    const subtableRange = { min: subtable.min, max: subtable.max };

    if (um66) {
      const row = subtable.rows.find(r => r.um66);
      path.push({
        tableId: table.id,
        subtable: subtableRange,
        subtableRoll,
        roll,
        adjustedRoll,
        row: { min: row?.min ?? null, max: row?.max ?? null },
        clamped: null,
      });
      const special = settings.specials.find(s => s.tableIds.includes(table.id));
      return {
        check,
        path,
        next: null,
        result: { entry: { type: 'special' }, um66: true, special: special ? { key: special.key } : null, conditionUnmet: null },
      };
    }

    const { row, clamped } = pickRow(table, subtable, adjustedRoll);
    path.push({
      tableId: table.id,
      subtable: subtableRange,
      subtableRoll,
      roll,
      adjustedRoll,
      row: { min: row.min, max: row.max },
      clamped,
    });
    const conditionUnmet = unmetCondition(row, request);
    const entry = row.entry;
    if (entry.type !== 'redirect' || conditionUnmet) {
      return { check, path, next: null, result: { entry, um66: false, special: null, conditionUnmet } };
    }

    const target = entry.tableId === null ? region : findTable(lookup, entry.tableId);
    if (!target)
      throw new ValidationError(`Table ${table.id} sends to the biome table: the request needs a regionTableId`, INVALID_REQUEST);
    if (target.id === table.id) throw new ValidationError(`Table ${table.id} sends to itself`, INVALID_REQUEST);
    if (path.length >= MAX_ENCOUNTER_DEPTH) throw new ValidationError(`More than ${MAX_ENCOUNTER_DEPTH} redirects`, INVALID_REQUEST);
    table = target;
    bonus = entry.bonus;
  }
}

/** Avoidance and activity totals, the differential and the codes of Table 15.4b. */
export function resolveCheck(check: NonNullable<ResolveEncounterRequest['check']>, settings: EncounterSettings): EncounterCheckResult {
  const avoidance = check.avoidance.roll + modifierTotal('avoidance', check.avoidance.modifiers ?? [], settings);
  const activity = check.activity.roll + modifierTotal('activity', check.activity.modifiers ?? [], settings);
  const differential = activity - avoidance;
  const encounter = differential >= 1;
  const row = encounter ? settings.differentials.find(d => differential >= d.min && (d.max === null || differential <= d.max)) : undefined;
  const codes = row ? row[check.population] : [null, null];
  return { avoidance, activity, differential, encounter, social: codes[0] ?? null, creature: codes[1] ?? null };
}

function modifierTotal(side: ModifierSide, choices: EncounterModifierChoice[], settings: EncounterSettings): number {
  const groups = new Set<string>();
  const keys = new Set<string>();
  return choices.reduce((total, choice) => {
    const modifier = settings.modifiers.find(m => m.key === choice.key);
    if (!modifier) throw new ValidationError(`Unknown encounter modifier ${choice.key}`, INVALID_MODIFIER);
    if (modifier.side !== side) throw new ValidationError(`Modifier ${choice.key} is not an ${side} modifier`, INVALID_MODIFIER);
    if (keys.has(modifier.key)) throw new ValidationError(`Modifier ${choice.key} is repeated`, INVALID_MODIFIER);
    keys.add(modifier.key);
    if (modifier.group !== null) {
      if (groups.has(modifier.group)) throw new ValidationError(`Only one modifier of group ${modifier.group}`, INVALID_MODIFIER);
      groups.add(modifier.group);
    }
    if (modifier.value !== null) return total + modifier.value;
    if (typeof choice.value !== 'number' || !Number.isInteger(choice.value)) {
      throw new ValidationError(`Modifier ${choice.key} needs a value`, INVALID_MODIFIER);
    }
    return total + choice.value;
  }, 0);
}

function findTable(lookup: EncounterTableLookup, id: string): EncounterTable {
  const table = lookup(id);
  if (!table) throw new NotFoundError('Encounter table', id, 'encounter-table-not-found');
  return table;
}

/** The table of "Roll on Biome Table": the one named by the request, or the first table when it is a biome. */
function regionTable(request: ResolveEncounterRequest, first: EncounterTable, lookup: EncounterTableLookup): EncounterTable | null {
  if (!request.regionTableId) return first.kind === 'biome' ? first : null;
  const region = lookup(request.regionTableId);
  if (!region || region.kind === 'universal') {
    throw new ValidationError(`Region table ${request.regionTableId} must be a biome or location table`, INVALID_REQUEST);
  }
  return region;
}

function pickSubtable(subtables: EncounterSubtable[], roll: number): EncounterSubtable {
  const found = subtables.find(s => roll >= s.min && roll <= s.max);
  if (found) return found;
  return roll < subtables[0].min ? subtables[0] : subtables[subtables.length - 1];
}

/** The row of the roll; outside the range of the table the first or last row, with `clamped`. */
function pickRow(table: EncounterTable, subtable: EncounterSubtable, roll: number): { row: EncounterRow; clamped: 'low' | 'high' | null } {
  const ranged = subtable.rows
    .filter((r): r is EncounterRow & { min: number; max: number } => !r.um66 && r.min !== null && r.max !== null)
    .sort((a, b) => a.min - b.min);
  if (ranged.length === 0) throw new DomainError(`Encounter table ${table.id} has no rows`, 500, 'invalid-encounter-table');
  if (roll < ranged[0].min) return { row: ranged[0], clamped: 'low' };
  const last = ranged[ranged.length - 1];
  if (roll > last.max) return { row: last, clamped: 'high' };
  const row = ranged.find(r => roll >= r.min && roll <= r.max);
  if (!row) throw new DomainError(`Encounter table ${table.id} has no row for ${roll}`, 500, 'invalid-encounter-table');
  return { row, clamped: null };
}

function unmetCondition(row: EncounterRow, request: ResolveEncounterRequest): EncounterCondition | null {
  if (row.condition === 'water' && request.water === false) return 'water';
  if (row.condition === 'land' && request.land === false) return 'land';
  return null;
}
