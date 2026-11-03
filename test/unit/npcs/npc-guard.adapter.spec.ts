import type { RealmAccessLevel } from '../../../src/modules/npcs/application/ports/realm.port.js';
import type { RealmAccessService } from '../../../src/modules/npcs/application/services/realm-access.service.js';
import { Npc } from '../../../src/modules/npcs/domain/aggregates/npc.aggregate.js';
import { NpcGuardAdapter } from '../../../src/modules/npcs/infrastructure/security/npc-guard.adapter.js';
import { npcProps } from '../../support/npc-fixtures.js';

const USER = ['rmu-user'];
const ADMIN = ['rmu-admin'];

const setup = (levels: Record<string, RealmAccessLevel>) => {
  const map = new Map(Object.entries(levels));
  const levelsOf = vi.fn(() => Promise.resolve(map as ReadonlyMap<string, RealmAccessLevel>));
  const service = {
    levels: levelsOf,
    levelOf: (realmId: string, _userId: string, roles: readonly string[]) =>
      Promise.resolve(roles.includes('rmu-admin') ? 'manage' : (map.get(realmId) ?? 'none')),
    readableRealmIds: () => Promise.resolve([...map].filter(([, l]) => l !== 'none').map(([id]) => id)),
  } as unknown as RealmAccessService;
  return { guard: new NpcGuardAdapter(service), levelsOf };
};

const npc = (realmId: string, accessType: 'public' | 'private' = 'private') =>
  Npc.fromProps(npcProps({ realmId, accessType, owner: 'u1' }));

describe('NpcGuardAdapter', () => {
  it('reads with read, and changes and deletes with write', async () => {
    const { guard } = setup({ 'r-read': 'read', 'r-write': 'write' });
    await expect(guard.checkRead(npc('r-read'), 'u2', USER)).resolves.toBe('read');
    await expect(guard.checkUpdate(npc('r-read'), 'u2', USER)).rejects.toMatchObject({ statusCode: 403 });
    await expect(guard.checkDelete(npc('r-read'), 'u2', USER)).rejects.toMatchObject({ statusCode: 403 });
    await expect(guard.checkUpdate(npc('r-write'), 'u2', USER)).resolves.toBe('write');
    await expect(guard.checkDelete(npc('r-write'), 'u2', USER)).resolves.toBe('write');
  });

  it('gives the owner of the NPC nothing without the realm', async () => {
    const { guard } = setup({});
    await expect(guard.checkRead(npc('r-private'), 'u1', USER)).rejects.toMatchObject({ statusCode: 403, code: 'forbidden' });
  });

  it('lets an admin do anything without asking core', async () => {
    const { guard, levelsOf } = setup({});
    await expect(guard.checkDelete(npc('r-private', 'public'), 'a', ADMIN)).resolves.toBe('manage');
    await expect(guard.buildQueryPredicate('a', ADMIN)).resolves.toEqual({ type: 'empty' });
    expect(levelsOf).not.toHaveBeenCalled();
  });

  it('filters the list by the readable realms', async () => {
    const { guard } = setup({ 'r-read': 'read', 'r-manage': 'manage' });
    await expect(guard.buildQueryPredicate('u2', USER)).resolves.toEqual({ type: 'in', field: 'realmId', values: ['r-read', 'r-manage'] });
  });

  it('resolves a whole list with one question', async () => {
    const { guard, levelsOf } = setup({ 'r-read': 'read', 'r-manage': 'manage' });
    const accessOf = await guard.accessResolver('u2', USER);
    expect([npc('r-read'), npc('r-manage'), npc('r-manage', 'public'), npc('r-none')].map(accessOf)).toEqual([
      'read',
      'write',
      'read',
      'none',
    ]);
    expect(levelsOf).toHaveBeenCalledTimes(1);
  });

  it('creates with write on the realm: 400 realm-not-readable without read, 403 realm-not-writable with read', async () => {
    const { guard } = setup({ 'r-read': 'read', 'r-write': 'write' });
    await expect(guard.checkCreateInRealm('r-none', 'u2', USER)).rejects.toMatchObject({ statusCode: 400, code: 'realm-not-readable' });
    await expect(guard.checkCreateInRealm('r-read', 'u2', USER)).rejects.toMatchObject({ statusCode: 403, code: 'realm-not-writable' });
    await expect(guard.checkCreateInRealm('r-write', 'u2', USER)).resolves.toBeUndefined();
    await expect(guard.checkCreateInRealm('r-none', 'a', ADMIN)).resolves.toBeUndefined();
  });

  it('keeps public NPCs and creation for the right roles', () => {
    const { guard } = setup({});
    expect(() => guard.checkAccessType('public', USER)).toThrow(/Only an admin/);
    expect(() => guard.checkAccessType('public', ADMIN)).not.toThrow();
    expect(() => guard.checkAccessType('private', USER)).not.toThrow();
    expect(() => guard.checkCreate([])).toThrow();
    expect(() => guard.checkCreate(USER)).not.toThrow();
  });
});
