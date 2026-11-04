import request from 'supertest';
import { npcBody } from '../support/npc-fixtures.js';
import { ids, startApp, type E2eApp } from './support/app.js';

type NpcBody = Record<string, unknown> & { id: string; version: number };

describe('NPCs', () => {
  let e2e: E2eApp;

  const create = async (user: 'owner' | 'admin', extra: Record<string, unknown> = {}) => {
    const response = await request(e2e.server).post('/v1/npcs').set('Authorization', e2e.auth(user)).send(npcBody(extra));
    expect(response.status).toBe(201);
    return response.body as NpcBody;
  };

  beforeAll(async () => {
    e2e = await startApp();
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  it('stores the stat block with defaults and publishes the creation', async () => {
    const npc = await create('owner');
    expect(npc).toMatchObject({
      accessType: 'private',
      owner: 'e2e-owner',
      version: 0,
      size: 'big',
      deathHits: 110,
      criticalCodes: { reduceSeverity: false, immunities: [] },
      talents: [],
      source: null,
    });
    expect(npc.attacks).toEqual([
      expect.objectContaining({ attackTable: 'claw', notation: '40B(6)cl', alternativeTo: null, poison: null }),
      expect.objectContaining({ attackTable: 'bite', alternativeTo: 0 }),
    ]);
    expect(npc.skills).toEqual([{ skillId: 'perception', specialization: null, ranks: null, bonus: 40, note: '+5 smell' }]);
    const event = e2e.events.find(e => e.message.data.id === npc.id);
    expect(event).toMatchObject({ topic: 'internal.rmu-npcs.npc.created.v1', message: { eventType: 'created' } });
  });

  it('derives the trait id of the sense talents on create and returns it on read (spec 076)', async () => {
    const npc = await create('owner', {
      talents: [{ name: 'Darkvision', tier: 'II', params: "20'", traitId: 'ignored' }, { name: 'Tremorsense' }],
    });
    const expected = [
      { name: 'Darkvision', tier: 'II', params: "20'", dp: null, traitId: 'darkvision' },
      { name: 'Tremorsense', tier: null, params: null, dp: null, traitId: null },
    ];
    expect(npc.talents).toEqual(expected);
    const read = await request(e2e.server).get(`/v1/npcs/${npc.id}`).set('Authorization', e2e.auth('owner'));
    expect((read.body as NpcBody).talents).toEqual(expected);
  });

  it('stores the shield with its DB, the one of its type when it is missing (ADR 0010)', async () => {
    const given = await create('owner', { shield: { type: 'normal', db: 20, ranks: 8, bonus: 60 } });
    expect(given.shield).toEqual({ type: 'normal', db: 20, ranks: 8, bonus: 60 });
    const typeOnly = await create('owner', { shield: { type: 'full' } });
    expect(typeOnly.shield).toEqual({ type: 'full', db: 25, ranks: null, bonus: null });
    const read = await request(e2e.server).get(`/v1/npcs/${typeOnly.id}`).set('Authorization', e2e.auth('owner'));
    expect((read.body as NpcBody).shield).toEqual({ type: 'full', db: 25, ranks: null, bonus: null });
  });

  it('lists the NPCs of the realms the user reads, combined with the RSQL query (spec 073)', async () => {
    const own = await create('owner', { name: 'E2E own' });
    const catalog = await create('admin', { name: 'E2E catalog', accessType: 'public' });
    const list = await request(e2e.server).get('/v1/npcs?size=1000').set('Authorization', e2e.auth('owner'));
    expect(ids(list.body)).toEqual(expect.arrayContaining([own.id, catalog.id]));
    const stranger = await request(e2e.server).get('/v1/npcs?size=1000').set('Authorization', e2e.auth('other'));
    expect(ids(stranger.body)).not.toContain(own.id);
    const filtered = await request(e2e.server).get('/v1/npcs?q=accessType==public').set('Authorization', e2e.auth('owner'));
    expect(ids(filtered.body)).toContain(catalog.id);
    expect(ids(filtered.body)).not.toContain(own.id);
  });

  it('replaces the lists on a PATCH and keeps the rest', async () => {
    const npc = await create('owner');
    const response = await request(e2e.server)
      .patch(`/v1/npcs/${npc.id}`)
      .set('Authorization', e2e.auth('owner'))
      .send({ attacks: [{ ob: 50, size: 7, attackTable: 'horn' }], deathHits: null, version: 0 });
    expect(response.status).toBe(200);
    const body = response.body as NpcBody & { attacks: unknown[] };
    expect(body.attacks).toHaveLength(1);
    expect(body).toMatchObject({ deathHits: null, name: 'E2E bear', version: 1 });
  });

  it('stores, reads and patches attacks with no table (spec 060)', async () => {
    const npc = await create('owner', {
      attacks: [
        { ob: 60, size: 5, attackTable: null, notation: '60we' },
        { ob: 45, size: 5, notation: '45rw' },
        { ob: 40, size: 6, attackTable: 'claw', notation: '40B(6)cl' },
      ],
    });
    expect(npc.attacks).toEqual([
      expect.objectContaining({ attackTable: null, notation: '60we' }),
      expect.objectContaining({ attackTable: null, notation: '45rw' }),
      expect.objectContaining({ attackTable: 'claw' }),
    ]);
    const read = await request(e2e.server).get(`/v1/npcs/${npc.id}`).set('Authorization', e2e.auth('owner'));
    expect(read.status).toBe(200);
    expect((read.body as NpcBody & { attacks: { attackTable: string | null }[] }).attacks.map(a => a.attackTable)).toEqual([
      null,
      null,
      'claw',
    ]);
    const patched = await request(e2e.server)
      .patch(`/v1/npcs/${npc.id}`)
      .set('Authorization', e2e.auth('owner'))
      .send({
        attacks: [
          { ob: 70, size: 7, attackTable: 'horn' },
          { ob: 55, size: 5, attackTable: null, notation: '55se' },
        ],
        version: 0,
      });
    expect(patched.status).toBe(200);
    expect((patched.body as NpcBody & { attacks: unknown[] }).attacks).toEqual([
      expect.objectContaining({ attackTable: 'horn' }),
      expect.objectContaining({ attackTable: null, notation: '55se' }),
    ]);
    const empty = await request(e2e.server)
      .patch(`/v1/npcs/${npc.id}`)
      .set('Authorization', e2e.auth('owner'))
      .send({ attacks: [{ ob: 70, size: 7, attackTable: '' }], version: 1 });
    expect(empty.status).toBe(400);
  });

  it('rejects a PATCH on a stale version', async () => {
    const npc = await create('owner');
    const patch = (version: number) =>
      request(e2e.server).patch(`/v1/npcs/${npc.id}`).set('Authorization', e2e.auth('owner')).send({ level: 4, version });
    expect((await patch(0)).status).toBe(200);
    const stale = await patch(0);
    expect(stale.status).toBe(409);
    expect((stale.body as { code: string }).code).toBe('version-conflict');
  });

  it('neither writes nor publishes a PATCH without changes', async () => {
    const npc = await create('owner');
    const before = e2e.events.length;
    const response = await request(e2e.server).patch(`/v1/npcs/${npc.id}`).set('Authorization', e2e.auth('owner')).send({ level: 3 });
    expect((response.body as NpcBody).version).toBe(0);
    expect(e2e.events.length).toBe(before);
  });

  it('reads the NPCs stored before spec 054 with the new defaults', async () => {
    await e2e.connection.collection('npcs').insertOne({
      _id: 'legacy-npc' as never,
      realmId: 'e2e-realm',
      name: 'Legacy orc',
      category: 'humanoid',
      outlookType: 'obssesive',
      level: 2,
      hp: 30,
      db: 5,
      at: 4,
      initiative: 0,
      skills: [],
      items: [],
      attacks: [],
      owner: 'e2e-owner',
      createdAt: new Date(),
    });
    const response = await request(e2e.server).get('/v1/npcs/legacy-npc').set('Authorization', e2e.auth('owner'));
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ accessType: 'private', size: 'medium', movement: [], talents: [], version: 0 });
  });

  it('deletes an NPC and publishes the deletion', async () => {
    const npc = await create('owner');
    expect((await request(e2e.server).delete(`/v1/npcs/${npc.id}`).set('Authorization', e2e.auth('owner'))).status).toBe(204);
    expect((await request(e2e.server).get(`/v1/npcs/${npc.id}`).set('Authorization', e2e.auth('owner'))).status).toBe(404);
    expect(e2e.events.some(e => e.topic === 'internal.rmu-npcs.npc.deleted.v1' && e.message.data.id === npc.id)).toBe(true);
  });
});
