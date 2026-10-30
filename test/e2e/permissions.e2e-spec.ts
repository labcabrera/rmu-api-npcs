import request from 'supertest';
import { npcBody } from '../support/npc-fixtures.js';
import { startApp, type E2eApp, type UserName } from './support/app.js';

// The permission matrix of NPCs (spec 054): public NPCs are the catalog, read by everyone and written by admins only;
// private NPCs are read, changed and deleted by their owner or an admin.
type Caller = UserName | 'anonymous';

let e2e: E2eApp;

beforeAll(async () => {
  e2e = await startApp();
});

afterAll(async () => {
  await e2e?.stop();
});

const as = (caller: Caller, test: request.Test) => (caller === 'anonymous' ? test : test.set('Authorization', e2e.auth(caller)));

async function createAs(user: UserName, extra: Record<string, unknown> = {}): Promise<string> {
  const created = await request(e2e.server).post('/v1/npcs').set('Authorization', e2e.auth(user)).send(npcBody(extra));
  expect(created.status).toBe(201);
  return (created.body as { id: string }).id;
}

const privateNpc = () => createAs('owner');
const publicNpc = () => createAs('admin', { accessType: 'public' });

type Statuses = { read: number; create: number; write: number; remove: number };

const onPrivate: Record<Caller, Statuses> = {
  owner: { read: 200, create: 201, write: 200, remove: 204 },
  admin: { read: 200, create: 201, write: 200, remove: 204 },
  other: { read: 403, create: 201, write: 403, remove: 403 },
  noRole: { read: 403, create: 403, write: 403, remove: 403 },
  anonymous: { read: 401, create: 401, write: 401, remove: 401 },
};

const onPublic: Record<Caller, Statuses> = {
  owner: { read: 200, create: 403, write: 403, remove: 403 },
  admin: { read: 200, create: 201, write: 200, remove: 204 },
  other: { read: 200, create: 403, write: 403, remove: 403 },
  noRole: { read: 200, create: 403, write: 403, remove: 403 },
  anonymous: { read: 401, create: 401, write: 401, remove: 401 },
};

describe.each(Object.keys(onPrivate) as Caller[])('as %s', caller => {
  describe('a private NPC of the owner', () => {
    const status = onPrivate[caller];

    it(`reads it: ${status.read}`, async () => {
      const id = await privateNpc();
      expect((await as(caller, request(e2e.server).get(`/v1/npcs/${id}`))).status).toBe(status.read);
    });

    it(`creates one: ${status.create}`, async () => {
      expect((await as(caller, request(e2e.server).post('/v1/npcs')).send(npcBody())).status).toBe(status.create);
    });

    it(`changes it: ${status.write}`, async () => {
      const id = await privateNpc();
      const response = await as(caller, request(e2e.server).patch(`/v1/npcs/${id}`)).send({ description: `By ${caller}` });
      expect(response.status).toBe(status.write);
    });

    it(`deletes it: ${status.remove}`, async () => {
      const id = await privateNpc();
      expect((await as(caller, request(e2e.server).delete(`/v1/npcs/${id}`))).status).toBe(status.remove);
    });
  });

  describe('a public NPC of the catalog', () => {
    const status = onPublic[caller];

    it(`reads it: ${status.read}`, async () => {
      const id = await publicNpc();
      expect((await as(caller, request(e2e.server).get(`/v1/npcs/${id}`))).status).toBe(status.read);
    });

    it(`creates one: ${status.create}`, async () => {
      const response = await as(caller, request(e2e.server).post('/v1/npcs')).send(npcBody({ accessType: 'public' }));
      expect(response.status).toBe(status.create);
    });

    it(`changes it: ${status.write}`, async () => {
      const id = await publicNpc();
      const response = await as(caller, request(e2e.server).patch(`/v1/npcs/${id}`)).send({ description: `By ${caller}` });
      expect(response.status).toBe(status.write);
    });

    it(`deletes it: ${status.remove}`, async () => {
      const id = await publicNpc();
      expect((await as(caller, request(e2e.server).delete(`/v1/npcs/${id}`))).status).toBe(status.remove);
    });
  });
});

describe('making an NPC public', () => {
  it('is only for admins', async () => {
    const id = await privateNpc();
    const byOwner = await request(e2e.server)
      .patch(`/v1/npcs/${id}`)
      .set('Authorization', e2e.auth('owner'))
      .send({ accessType: 'public' });
    expect(byOwner.status).toBe(403);
    const byAdmin = await request(e2e.server)
      .patch(`/v1/npcs/${id}`)
      .set('Authorization', e2e.auth('admin'))
      .send({ accessType: 'public' });
    expect(byAdmin.status).toBe(200);
  });
});
