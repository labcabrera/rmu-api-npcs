import {
  MAX_ENCOUNTER_DEPTH,
  resolveEncounter,
  type ResolveEncounterRequest,
} from '../../../src/modules/encounters/domain/services/resolve-encounter.js';
import type { EncounterTable } from '../../../src/modules/encounters/domain/value-objects/encounter-table.vo.js';
import { TEST_SETTINGS, TEST_TABLES, tableLookup } from '../../support/encounter-fixtures.js';

const resolve = (request: Partial<ResolveEncounterRequest>) =>
  resolveEncounter({ tableId: 'test-plains', ...request }, tableLookup, TEST_SETTINGS);

const expectError = (request: Partial<ResolveEncounterRequest>, code: string, statusCode = 400) =>
  expect(() => resolve(request)).toThrow(expect.objectContaining({ code, statusCode }));

/** The numeric example of 15.4: avoidance 32 - 20 = 12, activity 72 + 10 + 25 = 107. */
const bookCheck = {
  population: 'light' as const,
  avoidance: { roll: 32, modifiers: [{ key: 'test-group-large' }, { key: 'test-stealth', value: 0 }] },
  activity: { roll: 72, modifiers: [{ key: 'test-terrain-rough' }, { key: 'test-hostile' }] },
};

describe('resolveEncounter', () => {
  describe('the check', () => {
    it('gives differential 95 and b / s on a light population for 12 against 107', () => {
      const response = resolve({ check: bookCheck });
      expect(response.check).toEqual({ avoidance: 12, activity: 107, differential: 95, encounter: true, social: 'b', creature: 's' });
      expect(response.next).toEqual({ step: 'creature', tableId: 'test-plains', roll: 'open', bonus: 0 });
      expect(response.result).toBeNull();
    });

    it('adds the value of a variable modifier and ignores the one sent with a fixed modifier', () => {
      const response = resolve({
        check: {
          ...bookCheck,
          avoidance: {
            roll: 32,
            modifiers: [
              { key: 'test-group-large', value: 99 },
              { key: 'test-stealth', value: 15 },
            ],
          },
        },
      });
      expect(response.check).toMatchObject({ avoidance: 27, differential: 80, social: 's', creature: null });
    });

    it('uses the open last row of the differentials', () => {
      const response = resolve({ check: { ...bookCheck, activity: { roll: 500 } } });
      expect(response.check).toMatchObject({ differential: 488, social: 't', creature: 'a' });
    });

    it.each([
      ['zero', 12],
      ['negative', -40],
    ])('has no encounter and walks no table with a %s differential', (_, activityRoll) => {
      const response = resolve({ check: { ...bookCheck, activity: { roll: activityRoll } }, rolls: [30] });
      expect(response.check).toMatchObject({ encounter: false, social: null, creature: null });
      expect(response).toMatchObject({ path: [], next: null, result: null });
    });

    it('is null when no check is sent', () => {
      expect(resolve({ rolls: [30] }).check).toBeNull();
    });

    it.each([
      ['an unknown key', { roll: 10, modifiers: [{ key: 'test-unknown' }] }],
      ['a key of the other side', { roll: 10, modifiers: [{ key: 'test-hostile' }] }],
      ['a variable modifier without value', { roll: 10, modifiers: [{ key: 'test-stealth' }] }],
      ['two options of one group', { roll: 10, modifiers: [{ key: 'test-group-solo' }, { key: 'test-group-large' }] }],
      [
        'a repeated key',
        {
          roll: 10,
          modifiers: [
            { key: 'test-stealth', value: 1 },
            { key: 'test-stealth', value: 2 },
          ],
        },
      ],
    ])('rejects %s', (_, avoidance) => {
      expectError({ check: { ...bookCheck, avoidance } }, 'invalid-encounter-modifier');
    });
  });

  describe('the creature', () => {
    it('gives the row of the roll with its NPCs', () => {
      const response = resolve({ rolls: [30] });
      expect(response.path).toEqual([
        {
          tableId: 'test-plains',
          subtable: { min: 1, max: 100 },
          subtableRoll: null,
          roll: 30,
          adjustedRoll: 30,
          row: { min: 21, max: 50 },
          clamped: null,
        },
      ]);
      expect(response.next).toBeNull();
      expect(response.result).toEqual({
        entry: { type: 'npc', npcIds: ['cl1-test-wolf'], label: 'Test wolf' },
        um66: false,
        special: null,
        conditionUnmet: null,
      });
    });

    it('adds the creature modifier to an open roll', () => {
      const response = resolve({ rolls: [180], creatureModifier: 40 });
      expect(response.path[0]).toMatchObject({ roll: 180, adjustedRoll: 220, row: { min: 201, max: 300 } });
      expect(response.result!.entry).toMatchObject({ npcIds: ['cl1-test-drake-young', 'cl1-test-drake-old'] });
    });

    it('picks the subtable of a split table with the first roll', () => {
      expect(resolve({ tableId: 'test-woods' }).next).toEqual({ step: 'subtable', tableId: 'test-woods', roll: 'straight', bonus: 0 });
      const missing = resolve({ tableId: 'test-woods', rolls: [20] });
      expect(missing.next).toEqual({ step: 'creature', tableId: 'test-woods', roll: 'open', bonus: 0 });
      expect(missing.path).toEqual([]);

      const first = resolve({ tableId: 'test-woods', rolls: [20, 160] });
      expect(first.path[0]).toMatchObject({ subtable: { min: 1, max: 50 }, subtableRoll: 20, roll: 160, row: { min: 151, max: 300 } });
      expect(first.result!.entry).toMatchObject({ npcIds: ['cl1-test-bear'] });

      const second = resolve({ tableId: 'test-woods', rolls: [75, 10] });
      expect(second.path[0].subtable).toEqual({ min: 51, max: 100 });
      expect(second.result!.entry).toEqual({ type: 'event', key: 'test-storm', label: 'Test storm' });
    });

    it('takes the first or last subtable for a subtable roll out of range', () => {
      expect(resolve({ tableId: 'test-woods', rolls: [0, 10] }).path[0].subtable).toEqual({ min: 1, max: 50 });
      expect(resolve({ tableId: 'test-woods', rolls: [130, 10] }).path[0].subtable).toEqual({ min: 51, max: 100 });
    });

    it('follows a redirect with its +100 bonus and keeps the creature modifier', () => {
      const missing = resolve({ rolls: [150], creatureModifier: 5 });
      expect(missing.next).toEqual({ step: 'creature', tableId: 'test-universal-monsters', roll: 'open', bonus: 100 });
      expect(missing.result).toBeNull();

      const response = resolve({ rolls: [150, 90], creatureModifier: 5 });
      expect(response.path.map(step => step.tableId)).toEqual(['test-plains', 'test-universal-monsters']);
      expect(response.path[1]).toMatchObject({ roll: 90, adjustedRoll: 195, row: { min: 1, max: 200 } });
      expect(response.result!.entry).toMatchObject({ npcIds: ['cl1-test-troll'] });

      const race = resolve({ rolls: [150, 110] });
      expect(race.result!.entry).toEqual({ type: 'race', raceId: 'test-race', label: 'Test race' });
    });

    it('does not modify a straight roll', () => {
      const response = resolve({ rolls: [10, 40], creatureModifier: 5 });
      expect(response.next).toBeNull();
      expect(response.path[0]).toMatchObject({ adjustedRoll: 15 });
      expect(response.path[1]).toMatchObject({ tableId: 'test-universal-animals', roll: 40, adjustedRoll: 40, row: { min: 1, max: 50 } });
    });

    it('asks for a straight roll on a straight redirect target', () => {
      expect(resolve({ rolls: [10] }).next).toEqual({ step: 'creature', tableId: 'test-universal-animals', roll: 'straight', bonus: 0 });
    });

    it('rolls on the region table for a redirect to the biome table', () => {
      const missing = resolve({ tableId: 'test-ruins', regionTableId: 'test-woods', rolls: [50] });
      expect(missing.next).toEqual({ step: 'subtable', tableId: 'test-woods', roll: 'straight', bonus: 0 });

      const response = resolve({ tableId: 'test-ruins', regionTableId: 'test-plains', rolls: [50, 30] });
      expect(response.path.map(step => step.tableId)).toEqual(['test-ruins', 'test-plains']);
      expect(response.result!.entry).toMatchObject({ npcIds: ['cl1-test-wolf'] });
    });

    it('needs a biome or location region for a redirect to the biome table', () => {
      expectError({ tableId: 'test-ruins', rolls: [50] }, 'invalid-encounter-request');
      expectError({ tableId: 'test-ruins', regionTableId: 'test-universal-animals', rolls: [50] }, 'invalid-encounter-request');
      expectError({ tableId: 'test-ruins', regionTableId: 'test-unknown', rolls: [50] }, 'invalid-encounter-request');
      expectError({ tableId: 'test-ruins', regionTableId: 'test-ruins', rolls: [50, 50] }, 'invalid-encounter-request');
      // Not needed: the region is only checked when it is sent.
      expect(resolve({ tableId: 'test-ruins', rolls: [150] }).result!.entry).toEqual({ type: 'text', label: 'Test ghost' });
    });

    it('stops a chain of redirects longer than the limit', () => {
      const loop: EncounterTable[] = [
        { id: 'loop-a', biome: null, kind: 'universal', roll: 'open', subtables: [{ min: 1, max: 100, rows: [] }], source: null },
        { id: 'loop-b', biome: null, kind: 'universal', roll: 'open', subtables: [{ min: 1, max: 100, rows: [] }], source: null },
      ];
      loop[0].subtables[0].rows = [
        { min: 1, max: 300, um66: false, condition: null, entry: { type: 'redirect', tableId: 'loop-b', bonus: 0 } },
      ];
      loop[1].subtables[0].rows = [
        { min: 1, max: 300, um66: false, condition: null, entry: { type: 'redirect', tableId: 'loop-a', bonus: 0 } },
      ];
      const lookup = (id: string) => loop.find(table => table.id === id);
      const rolls = Array.from({ length: MAX_ENCOUNTER_DEPTH + 2 }, () => 10);
      expect(() => resolveEncounter({ tableId: 'loop-a', rolls }, lookup, TEST_SETTINGS)).toThrow(
        expect.objectContaining({ code: 'invalid-encounter-request' }),
      );
    });

    it.each([
      [-20, 'low', { min: 1, max: 20 }],
      [350, 'high', { min: 201, max: 300 }],
    ])('clamps a roll of %i to the %s row', (roll, clamped, range) => {
      const response = resolve({ rolls: [roll] });
      expect(response.path[0]).toMatchObject({ adjustedRoll: roll, row: range, clamped });
    });

    it('clamps a straight roll to the rows of its table', () => {
      expect(resolve({ tableId: 'test-universal-animals', rolls: [120] }).path[0]).toMatchObject({
        row: { min: 51, max: 100 },
        clamped: 'high',
      });
    });

    describe('UM 66', () => {
      it('gives the special of the table from the unmodified roll', () => {
        const response = resolve({ rolls: [96], unmodified: [66], creatureModifier: 30 });
        expect(response.path[0]).toMatchObject({ roll: 96, adjustedRoll: 126, row: { min: null, max: null }, clamped: null });
        expect(response.result).toEqual({ entry: { type: 'special' }, um66: true, special: { key: 'test-wild' }, conditionUnmet: null });
      });

      it('takes the roll itself when no unmodified roll is sent and no modifier applies', () => {
        expect(resolve({ rolls: [66] }).result).toMatchObject({ um66: true, special: { key: 'test-wild' } });
        expect(resolve({ rolls: [66], creatureModifier: 10 }).result).toMatchObject({ um66: false, entry: { npcIds: ['cl1-test-hare'] } });
      });

      it('is not a 66 when the unmodified roll says otherwise', () => {
        expect(resolve({ rolls: [66], unmodified: [65] }).result).toMatchObject({ um66: false });
      });

      it('uses the table walked to and has no special for a table out of the settings', () => {
        expect(resolve({ rolls: [10, 66] }).result).toMatchObject({ um66: true, special: { key: 'test-tame' } });
        expect(resolve({ rolls: [150, 66], unmodified: [50, 66] }).result).toMatchObject({ um66: true, special: null });
      });

      it('checks creature rolls only, not the subtable roll', () => {
        const response = resolve({ tableId: 'test-woods', rolls: [66, 20] });
        expect(response.result).toMatchObject({ um66: false, entry: { type: 'event' } });
      });
    });

    describe('conditions', () => {
      it('flags a water row when the request says there is no water', () => {
        expect(resolve({ rolls: [55], water: false }).result).toMatchObject({
          entry: { npcIds: ['cl1-test-fish'] },
          conditionUnmet: 'water',
        });
        expect(resolve({ rolls: [55], water: true }).result!.conditionUnmet).toBeNull();
        expect(resolve({ rolls: [55] }).result!.conditionUnmet).toBeNull();
      });

      it('flags a land row when the request says there is no land', () => {
        expect(resolve({ tableId: 'test-universal-animals', rolls: [70], land: false }).result!.conditionUnmet).toBe('land');
        expect(resolve({ tableId: 'test-universal-animals', rolls: [70], land: true }).result!.conditionUnmet).toBeNull();
      });
    });

    it('is a 404 for an unknown table', () => {
      expectError({ tableId: 'test-unknown' }, 'encounter-table-not-found', 404);
    });

    it('reports a table without rows', () => {
      const empty: EncounterTable = { ...TEST_TABLES[0], id: 'empty', subtables: [{ min: 1, max: 100, rows: [] }] };
      expect(() => resolveEncounter({ tableId: 'empty', rolls: [10] }, () => empty, TEST_SETTINGS)).toThrow(
        expect.objectContaining({ code: 'invalid-encounter-table' }),
      );
    });
  });
});
