import request from 'supertest';
import { npcBody } from '../support/npc-fixtures.js';
import { startApp, type E2eApp } from './support/app.js';

// Spec 044, fallo 10: the body is validated as sent (no implicit conversion); the query converts page and size itself.
describe('validation', () => {
  let e2e: E2eApp;

  const create = (body: object) => request(e2e.server).post('/v1/npcs').set('Authorization', e2e.auth('owner')).send(body);
  const messages = (body: unknown) => (body as { message: string[] | string }).message;

  beforeAll(async () => {
    e2e = await startApp();
  });

  afterAll(async () => {
    await e2e?.stop();
  });

  it('accepts the NPC as typed', async () => {
    expect((await create(npcBody())).status).toBe(201);
  });

  it('rejects a number in a string field', async () => {
    const response = await create(npcBody({ name: 42 }));
    expect(response.status).toBe(400);
    expect(messages(response.body)).toContain('name must be a string');
  });

  it('rejects a string in a number field', async () => {
    expect((await create(npcBody({ hp: '80' }))).status).toBe(400);
  });

  it('rejects values outside the lists of the book', async () => {
    expect((await create(npcBody({ category: 'robot' }))).status).toBe(400);
    expect((await create(npcBody({ size: 'colossal' }))).status).toBe(400);
    expect((await create(npcBody({ outlookType: 'obssesive' }))).status).toBe(400);
    expect((await create(npcBody({ movement: [{ mode: 'teleport', baseRate: 10, maxPace: 'run' }] }))).status).toBe(400);
  });

  it('validates the fright level (spec 068)', async () => {
    expect((await create(npcBody({ frightLevel: 31 }))).status).toBe(400);
    expect((await create(npcBody({ frightLevel: -1 }))).status).toBe(400);
    expect((await create(npcBody({ frightLevel: '10' }))).status).toBe(400);
    const created = await create(npcBody({ frightLevel: 10 }));
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ frightLevel: 10 });
  });

  it('validates the shield (ADR 0010)', async () => {
    expect((await create(npcBody({ shield: { type: 'hide', ranks: 0, bonus: 0 } }))).status).toBe(400);
    expect((await create(npcBody({ shield: { type: 'normal', db: -5 } }))).status).toBe(400);
    expect((await create(npcBody({ shield: { type: 'normal', ranks: 1.5 } }))).status).toBe(400);
    expect((await create(npcBody({ shield: { type: 'normal', bonus: '60' } }))).status).toBe(400);
  });

  it('validates the nested attacks', async () => {
    expect((await create(npcBody({ attacks: [{ ob: 10, size: 14, attackTable: 'bite' }] }))).status).toBe(400);
    expect((await create(npcBody({ attacks: [{ ob: 10, size: 5, attackTable: '' }] }))).status).toBe(400);
    expect((await create(npcBody({ attacks: [{ ob: 10, size: 5, attackTable: 7 }] }))).status).toBe(400);
    // An attack with no table (spec 060) is valid
    expect((await create(npcBody({ attacks: [{ ob: 10, size: 5 }] }))).status).toBe(201);
  });

  it('checks the rules of the domain', async () => {
    const alternative = await create(npcBody({ attacks: [{ ob: 10, size: 5, attackTable: 'bite', alternativeTo: 0 }] }));
    expect(alternative.status).toBe(400);
    expect(messages(alternative.body)).toMatch(/alternative of a previous attack/);
    const death = await create(npcBody({ hp: 80, deathHits: 50 }));
    expect(death.status).toBe(400);
    const skills = await create(
      npcBody({
        skills: [
          { skillId: 'perception', bonus: 1 },
          { skillId: 'perception', bonus: 2 },
        ],
      }),
    );
    expect(skills.status).toBe(400);
  });

  it('rejects an unknown realm', async () => {
    const response = await create(npcBody({ realmId: 'missing-realm' }));
    expect(response.status).toBe(400);
    expect(e2e.realmLookups).toContain('missing-realm');
  });

  it('still converts page and size from the query', async () => {
    const response = await request(e2e.server).get('/v1/npcs?page=0&size=20').set('Authorization', e2e.auth('owner'));
    expect(response.status).toBe(200);
    expect((response.body as { pagination: unknown }).pagination).toMatchObject({ page: 0, size: 20 });
    const bad = await request(e2e.server).get('/v1/npcs?size=abc').set('Authorization', e2e.auth('owner'));
    expect(bad.status).toBe(400);
  });
});
