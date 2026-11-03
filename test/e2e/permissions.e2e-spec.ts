import type { KafkaContext } from '@nestjs/microservices';
import request from 'supertest';
import { KafkaRealmEventConsumer } from '../../src/modules/npcs/interfaces/messaging/kafka.realm-event-consumer.js';
import { npcBody } from '../support/npc-fixtures.js';
import { CORE_DOWN, ids, REALM_ACCESS, startApp, type E2eApp, type UserName } from './support/app.js';

// The permission matrix of NPCs (spec 073): an NPC is a child of its realm. e2e-realm is a private realm of the owner,
// shared with the writer (`write`) and the reader (`read`); `other` is a stranger to it. The NPC's owner gives nothing.
// Public NPCs are the book catalog: read with the realm, written by admins only.
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

const userNpc = () => createAs('owner');
const catalogNpc = () => createAs('admin', { accessType: 'public' });

type Statuses = { read: number; create: number; write: number; remove: number };

const onUserNpc: Record<Caller, Statuses> = {
  admin: { read: 200, create: 201, write: 200, remove: 204 },
  owner: { read: 200, create: 201, write: 200, remove: 204 },
  writer: { read: 200, create: 201, write: 200, remove: 204 },
  reader: { read: 200, create: 403, write: 403, remove: 403 },
  other: { read: 403, create: 400, write: 403, remove: 403 },
  noRole: { read: 403, create: 403, write: 403, remove: 403 },
  anonymous: { read: 401, create: 401, write: 401, remove: 401 },
};

const onCatalogNpc: Record<Caller, Statuses> = {
  admin: { read: 200, create: 201, write: 200, remove: 204 },
  owner: { read: 200, create: 403, write: 403, remove: 403 },
  writer: { read: 200, create: 403, write: 403, remove: 403 },
  reader: { read: 200, create: 403, write: 403, remove: 403 },
  other: { read: 403, create: 403, write: 403, remove: 403 },
  noRole: { read: 403, create: 403, write: 403, remove: 403 },
  anonymous: { read: 401, create: 401, write: 401, remove: 401 },
};

describe.each(Object.keys(onUserNpc) as Caller[])('as %s', caller => {
  describe('an NPC of a user in the private realm', () => {
    const status = onUserNpc[caller];

    it(`reads it: ${status.read}`, async () => {
      const id = await userNpc();
      expect((await as(caller, request(e2e.server).get(`/v1/npcs/${id}`))).status).toBe(status.read);
    });

    it(`creates one: ${status.create}`, async () => {
      expect((await as(caller, request(e2e.server).post('/v1/npcs')).send(npcBody())).status).toBe(status.create);
    });

    it(`changes it: ${status.write}`, async () => {
      const id = await userNpc();
      const response = await as(caller, request(e2e.server).patch(`/v1/npcs/${id}`)).send({ description: `By ${caller}` });
      expect(response.status).toBe(status.write);
    });

    it(`deletes it: ${status.remove}`, async () => {
      const id = await userNpc();
      expect((await as(caller, request(e2e.server).delete(`/v1/npcs/${id}`))).status).toBe(status.remove);
    });
  });

  describe('a catalog NPC in the private realm', () => {
    const status = onCatalogNpc[caller];

    it(`reads it: ${status.read}`, async () => {
      const id = await catalogNpc();
      expect((await as(caller, request(e2e.server).get(`/v1/npcs/${id}`))).status).toBe(status.read);
    });

    it(`creates one: ${status.create}`, async () => {
      const response = await as(caller, request(e2e.server).post('/v1/npcs')).send(npcBody({ accessType: 'public' }));
      expect(response.status).toBe(status.create);
    });

    it(`changes it: ${status.write}`, async () => {
      const id = await catalogNpc();
      const response = await as(caller, request(e2e.server).patch(`/v1/npcs/${id}`)).send({ description: `By ${caller}` });
      expect(response.status).toBe(status.write);
    });

    it(`deletes it: ${status.remove}`, async () => {
      const id = await catalogNpc();
      expect((await as(caller, request(e2e.server).delete(`/v1/npcs/${id}`))).status).toBe(status.remove);
    });
  });
});

describe('the access of each caller', () => {
  it('is in every response, from the level on the realm', async () => {
    const own = await userNpc();
    const catalog = await catalogNpc();
    const access = async (caller: UserName, id: string) =>
      ((await request(e2e.server).get(`/v1/npcs/${id}`).set('Authorization', e2e.auth(caller))).body as { access: string }).access;
    expect(await access('admin', own)).toBe('manage');
    expect(await access('owner', own)).toBe('write');
    expect(await access('writer', own)).toBe('write');
    expect(await access('reader', own)).toBe('read');
    expect(await access('admin', catalog)).toBe('manage');
    expect(await access('owner', catalog)).toBe('read');
  });

  it('comes back on a creation and a change', async () => {
    const created = await request(e2e.server).post('/v1/npcs').set('Authorization', e2e.auth('writer')).send(npcBody());
    expect(created.body).toMatchObject({ owner: 'e2e-writer', access: 'write' });
    const id = (created.body as { id: string }).id;
    const changed = await request(e2e.server).patch(`/v1/npcs/${id}`).set('Authorization', e2e.auth('owner')).send({ level: 9 });
    expect(changed.body).toMatchObject({ owner: 'e2e-writer', level: 9, access: 'write' });
  });
});

describe('creating in a realm', () => {
  it('answers realm-not-writable with read only, and realm-not-readable without read', async () => {
    const byReader = await request(e2e.server).post('/v1/npcs').set('Authorization', e2e.auth('reader')).send(npcBody());
    expect(byReader.status).toBe(403);
    expect(byReader.body).toMatchObject({ code: 'realm-not-writable' });
    const byStranger = await request(e2e.server).post('/v1/npcs').set('Authorization', e2e.auth('other')).send(npcBody());
    expect(byStranger.status).toBe(400);
    expect(byStranger.body).toMatchObject({ code: 'realm-not-readable' });
    const inPublic = await request(e2e.server)
      .post('/v1/npcs')
      .set('Authorization', e2e.auth('other'))
      .send(npcBody({ realmId: 'e2e-public-realm' }));
    expect(inPublic.status).toBe(403);
    expect(inPublic.body).toMatchObject({ code: 'realm-not-writable' });
  });
});

describe('a public realm', () => {
  it('is read by everyone and written only by who writes in it', async () => {
    const id = await createAs('owner', { realmId: 'e2e-public-realm' });
    const read = await request(e2e.server).get(`/v1/npcs/${id}`).set('Authorization', e2e.auth('other'));
    expect(read.status).toBe(200);
    expect(read.body).toMatchObject({ access: 'read' });
    expect((await request(e2e.server).get(`/v1/npcs/${id}`).set('Authorization', e2e.auth('noRole'))).status).toBe(200);
    const patch = await request(e2e.server).patch(`/v1/npcs/${id}`).set('Authorization', e2e.auth('other')).send({ level: 2 });
    expect(patch.status).toBe(403);
    expect((await request(e2e.server).delete(`/v1/npcs/${id}`).set('Authorization', e2e.auth('other'))).status).toBe(403);
  });
});

describe('the list', () => {
  it('has the NPCs of the realms the caller reads, and all of them for an admin', async () => {
    const privateOne = await userNpc();
    const privateCatalog = await catalogNpc();
    const publicOne = await createAs('owner', { realmId: 'e2e-public-realm' });
    const list = async (caller: UserName) =>
      ids((await request(e2e.server).get('/v1/npcs?size=1000').set('Authorization', e2e.auth(caller))).body);
    for (const caller of ['admin', 'owner', 'writer', 'reader'] as const) {
      expect(await list(caller)).toEqual(expect.arrayContaining([privateOne, privateCatalog, publicOne]));
    }
    const stranger = await list('other');
    expect(stranger).toContain(publicOne);
    expect(stranger).not.toContain(privateOne);
    expect(stranger).not.toContain(privateCatalog);
  });

  it('carries the access of each row', async () => {
    const own = await userNpc();
    const catalog = await catalogNpc();
    const response = await request(e2e.server).get('/v1/npcs?size=1000').set('Authorization', e2e.auth('writer'));
    const rows = (response.body as { content: { id: string; access: string }[] }).content;
    expect(rows.find(row => row.id === own)?.access).toBe('write');
    expect(rows.find(row => row.id === catalog)?.access).toBe('read');
  });

  it('asks core once per user within the cache time, and never for an admin', async () => {
    e2e.clearAccessCache();
    e2e.accessLookups.length = 0;
    await request(e2e.server).get('/v1/npcs').set('Authorization', e2e.auth('reader'));
    await request(e2e.server).get('/v1/npcs').set('Authorization', e2e.auth('reader'));
    await request(e2e.server).get('/v1/npcs').set('Authorization', e2e.auth('admin'));
    expect(e2e.accessLookups).toEqual(['e2e-reader']);
  });
});

describe('losing the realm', () => {
  afterEach(() => {
    CORE_DOWN.value = false;
    e2e.resetRealmAccess();
  });

  it('leaves the creator of an NPC without access to it', async () => {
    const id = await createAs('writer');
    REALM_ACCESS.set('e2e-realm:e2e-writer', 'none');
    e2e.clearAccessCache();
    expect((await request(e2e.server).get(`/v1/npcs/${id}`).set('Authorization', e2e.auth('writer'))).status).toBe(403);
    const patch = await request(e2e.server).patch(`/v1/npcs/${id}`).set('Authorization', e2e.auth('writer')).send({ level: 2 });
    expect(patch.status).toBe(403);
  });

  it('never opens the access when core fails: 502', async () => {
    const id = await userNpc();
    CORE_DOWN.value = true;
    e2e.clearAccessCache();
    const read = await request(e2e.server).get(`/v1/npcs/${id}`).set('Authorization', e2e.auth('owner'));
    expect(read.status).toBe(502);
    expect((await request(e2e.server).get('/v1/npcs').set('Authorization', e2e.auth('owner'))).status).toBe(502);
    // An admin does not need core.
    expect((await request(e2e.server).get(`/v1/npcs/${id}`).set('Authorization', e2e.auth('admin'))).status).toBe(200);
  });
});

describe('making an NPC public', () => {
  it('is only for admins', async () => {
    const id = await userNpc();
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

describe('a deleted realm', () => {
  const context = { getTopic: () => 'internal.rmu-core.realm.deleted.v1' } as unknown as KafkaContext;
  const deleteRealm = (realmId: string) => e2e.app.get(KafkaRealmEventConsumer).handleRealmDeleted({ data: { id: realmId } }, context);
  const status = async (id: string) => (await request(e2e.server).get(`/v1/npcs/${id}`).set('Authorization', e2e.auth('admin'))).status;

  it('deletes its NPCs, publishes each deletion and keeps the rest; a repeated message does nothing', async () => {
    const gone = [await userNpc(), await catalogNpc()];
    const kept = await createAs('owner', { realmId: 'e2e-public-realm' });
    const before = e2e.events.length;

    await deleteRealm('e2e-realm');

    for (const id of gone) expect(await status(id)).toBe(404);
    expect(await status(kept)).toBe(200);
    const deletions = e2e.events.slice(before).filter(event => event.topic === 'internal.rmu-npcs.npc.deleted.v1');
    expect(deletions.map(event => event.message.data.id)).toEqual(expect.arrayContaining(gone));
    expect(deletions.map(event => event.message.data.id)).not.toContain(kept);

    const after = e2e.events.length;
    await deleteRealm('e2e-realm');
    expect(e2e.events.length).toBe(after);
  });
});
