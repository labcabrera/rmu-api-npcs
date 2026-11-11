import request from 'supertest';
import { settingsDocument, tableDocuments } from '../support/encounter-fixtures.js';
import { startApp, type E2eApp } from './support/app.js';

type ErrorBody = { statusCode: number; code: string };

// Encounter tables and the resolution of the rolls (spec 061), on synthetic documents seeded as the data script would.
describe('Encounters', () => {
  let e2e: E2eApp;

  const get = (path: string) => request(e2e.server).get(path).set('Authorization', e2e.auth('noRole'));
  const resolve = (body: Record<string, unknown>) =>
    request(e2e.server).post('/v1/encounters/resolve').set('Authorization', e2e.auth('owner')).send(body);
  const settings = () => e2e.connection.collection('encounter-settings');

  beforeAll(async () => {
    e2e = await startApp();
    // Out of order, to check the sort by kind and id.
    await e2e.connection.collection('encounter-tables').insertMany([...tableDocuments()].reverse() as never[]);
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  it('needs an authenticated user on every endpoint', async () => {
    for (const path of ['/v1/encounter-tables', '/v1/encounter-tables/test-plains', '/v1/encounter-settings']) {
      expect((await request(e2e.server).get(path)).status).toBe(401);
    }
    expect((await request(e2e.server).post('/v1/encounters/resolve').send({ tableId: 'test-plains' })).status).toBe(401);
  });

  it('answers 404 encounter-settings-not-found before the import', async () => {
    const response = await get('/v1/encounter-settings');
    expect(response.status).toBe(404);
    expect((response.body as ErrorBody).code).toBe('encounter-settings-not-found');
    const resolved = await resolve({ tableId: 'test-plains', rolls: [30] });
    expect(resolved.status).toBe(404);
    expect((resolved.body as ErrorBody).code).toBe('encounter-settings-not-found');
  });

  describe('with the settings imported', () => {
    beforeAll(async () => {
      await settings().insertOne(settingsDocument() as never);
    });

    it('lists the tables without rows, sorted by kind and id', async () => {
      const response = await get('/v1/encounter-tables');
      expect(response.status).toBe(200);
      const body = response.body as { id: string; subtables: Record<string, unknown>[] }[];
      expect(body.map(table => table.id)).toEqual([
        'test-plains',
        'test-woods',
        'test-ruins',
        'test-universal-animals',
        'test-universal-monsters',
      ]);
      expect(body[1]).toEqual({
        id: 'test-woods',
        biome: 'W',
        kind: 'biome',
        roll: 'open',
        subtables: [
          { min: 1, max: 50 },
          { min: 51, max: 100 },
        ],
      });
    });

    it('reads a whole table', async () => {
      const response = await get('/v1/encounter-tables/test-plains');
      expect(response.status).toBe(200);
      const expected = tableDocuments().find(doc => doc._id === 'test-plains')!;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...rest } = expected;
      expect(response.body).toEqual({ id: 'test-plains', ...rest });
    });

    it('answers 404 encounter-table-not-found for an unknown table', async () => {
      const response = await get('/v1/encounter-tables/test-unknown');
      expect(response.status).toBe(404);
      expect((response.body as ErrorBody).code).toBe('encounter-table-not-found');
    });

    it('reads the settings', async () => {
      const response = await get('/v1/encounter-settings');
      expect(response.status).toBe(200);
      const { _id, ...rest } = settingsDocument();
      expect(response.body).toEqual({ id: _id, ...rest });
    });

    it('resolves the check and a redirect with its bonus', async () => {
      const response = await resolve({
        check: {
          population: 'light',
          avoidance: { roll: 32, modifiers: [{ key: 'test-group-large' }, { key: 'test-stealth', value: 0 }] },
          activity: { roll: 72, modifiers: [{ key: 'test-terrain-rough' }, { key: 'test-hostile' }] },
        },
        tableId: 'test-plains',
        water: false,
        land: true,
        rolls: [150, 90],
        unmodified: [50, 90],
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        check: { avoidance: 12, activity: 107, differential: 95, encounter: true, social: 'b', creature: 's' },
        path: [
          {
            tableId: 'test-plains',
            subtable: { min: 1, max: 100 },
            subtableRoll: null,
            roll: 150,
            adjustedRoll: 150,
            row: { min: 101, max: 200 },
            clamped: null,
          },
          {
            tableId: 'test-universal-monsters',
            subtable: { min: 1, max: 300 },
            subtableRoll: null,
            roll: 90,
            adjustedRoll: 190,
            row: { min: 1, max: 200 },
            clamped: null,
          },
        ],
        next: null,
        result: {
          entry: { type: 'npc', npcIds: ['cl1-test-troll'], label: 'Test troll' },
          um66: false,
          special: null,
          conditionUnmet: null,
        },
      });
    });

    it('says which roll is missing', async () => {
      const response = await resolve({ tableId: 'test-woods' });
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        check: null,
        path: [],
        next: { step: 'subtable', tableId: 'test-woods', roll: 'straight', bonus: 0 },
        result: null,
      });
    });

    it('gives the special of a UM 66', async () => {
      const response = await resolve({ tableId: 'test-woods', rolls: [20, 96], unmodified: [20, 66], creatureModifier: 30 });
      expect(response.body).toMatchObject({ result: { entry: { type: 'special' }, um66: true, special: { key: 'test-wild' } } });
    });

    it.each([
      [
        'an unknown modifier',
        { check: { population: 'light', avoidance: { roll: 1, modifiers: [{ key: 'nope' }] }, activity: { roll: 1 } } },
        'invalid-encounter-modifier',
      ],
      [
        'a region that is not a biome or location',
        { tableId: 'test-ruins', regionTableId: 'test-universal-monsters', rolls: [10] },
        'invalid-encounter-request',
      ],
      ['a missing region', { tableId: 'test-ruins', rolls: [10] }, 'invalid-encounter-request'],
      ['an unknown population', { check: { population: 'crowded', avoidance: { roll: 1 }, activity: { roll: 1 } } }, 'bad-request'],
      ['a roll that is not an integer', { rolls: [10.5] }, 'bad-request'],
      ['rolls that are not an array', { rolls: 10 }, 'bad-request'],
      [
        'a modifier without key',
        { check: { population: 'light', avoidance: { roll: 1, modifiers: [{}] }, activity: { roll: 1 } } },
        'bad-request',
      ],
    ])('answers 400 for %s', async (_, body, code) => {
      const response = await resolve({ tableId: 'test-plains', ...body });
      expect(response.status).toBe(400);
      expect((response.body as ErrorBody).code).toBe(code);
    });

    it('answers 400 without table and 404 for an unknown one', async () => {
      expect((await resolve({ rolls: [10] })).status).toBe(400);
      const response = await resolve({ tableId: 'test-unknown', rolls: [10] });
      expect(response.status).toBe(404);
      expect((response.body as ErrorBody).code).toBe('encounter-table-not-found');
    });
  });
});
