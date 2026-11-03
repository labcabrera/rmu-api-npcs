import { atLeast, type NpcAccessLevel, resolveNpcAccess } from '../../../src/modules/npcs/domain/services/npc-access.js';
import type { AccessType } from '../../../src/modules/shared/domain/entities/access-type.js';

const ADMIN = ['rmu-admin'];
const USER = ['rmu-user'];

// Spec 073, decision 1: the table of resolveChildAccess of core, with the NPC catalog as the system entity.
describe('resolveNpcAccess', () => {
  const table: [string, readonly string[], AccessType | undefined, NpcAccessLevel, NpcAccessLevel][] = [
    // admin: manage, whatever the realm and the NPC (admins never ask core: the realm level is `none`)
    ['admin, user NPC', ADMIN, 'private', 'none', 'manage'],
    ['admin, catalog NPC', ADMIN, 'public', 'none', 'manage'],
    ['admin, catalog NPC on a managed realm', ADMIN, 'public', 'manage', 'manage'],
    // catalog NPC: read with the realm, never more
    ['catalog NPC, realm none', USER, 'public', 'none', 'none'],
    ['catalog NPC, realm read', USER, 'public', 'read', 'read'],
    ['catalog NPC, realm write', USER, 'public', 'write', 'read'],
    ['catalog NPC, realm manage', USER, 'public', 'manage', 'read'],
    // the rest: the realm level, at most write
    ['user NPC, realm none', USER, 'private', 'none', 'none'],
    ['user NPC, realm read', USER, 'private', 'read', 'read'],
    ['user NPC, realm write', USER, 'private', 'write', 'write'],
    ['user NPC, realm manage', USER, 'private', 'manage', 'write'],
    // documents stored before spec 054 have no accessType: user NPCs
    ['legacy NPC, realm manage', USER, undefined, 'manage', 'write'],
    ['legacy NPC, realm none', USER, undefined, 'none', 'none'],
    // without roles, the realm decides as for any user
    ['no roles, user NPC, realm read', [], 'private', 'read', 'read'],
  ];

  it.each(table)('%s', (_name, roles, accessType, realmLevel, expected) => {
    expect(resolveNpcAccess({ accessType }, realmLevel, roles)).toBe(expected);
  });

  it('ignores the owner of the NPC', () => {
    const npc = { accessType: 'private' as const, owner: 'u1' };
    expect(resolveNpcAccess(npc, 'none', USER)).toBe('none');
  });
});

describe('atLeast', () => {
  it('orders none < read < write < manage', () => {
    expect(atLeast('write', 'read')).toBe(true);
    expect(atLeast('write', 'write')).toBe(true);
    expect(atLeast('read', 'write')).toBe(false);
    expect(atLeast('none', 'read')).toBe(false);
    expect(atLeast('manage', 'write')).toBe(true);
  });
});
