import type { AccessType } from '../../../shared/domain/entities/access-type.js';
import { RMU_ADMIN } from '../../../shared/domain/entities/user-roles.js';

/** What a user can do with an NPC or a realm (spec 073), from less to more, as the levels of core (spec 069). */
export const NPC_ACCESS_LEVELS = ['none', 'read', 'write', 'manage'] as const;

export type NpcAccessLevel = (typeof NPC_ACCESS_LEVELS)[number];

/** The level an NPC the user sees can have: what the responses carry in `access`. */
export type NpcAccess = Exclude<NpcAccessLevel, 'none'>;

export function atLeast(level: NpcAccessLevel, required: NpcAccessLevel): boolean {
  return NPC_ACCESS_LEVELS.indexOf(level) >= NPC_ACCESS_LEVELS.indexOf(required);
}

/**
 * The access to an NPC, a child of its realm (spec 073, decision 1), as `resolveChildAccess` of core:
 * 1. an admin manages every NPC;
 * 2. a public NPC is the book catalog (system): read when the realm is read, never more;
 * 3. the rest take the level on the realm, at most `write`.
 * The owner of the NPC gives nothing (answer 3): only the realm counts.
 */
export function resolveNpcAccess(
  npc: { accessType?: AccessType | null },
  realmLevel: NpcAccessLevel,
  roles: readonly string[],
): NpcAccessLevel {
  if (roles.includes(RMU_ADMIN)) return 'manage';
  if (realmLevel === 'none') return 'none';
  if (npc.accessType === 'public') return 'read';
  return realmLevel === 'manage' ? 'write' : realmLevel;
}

/**
 * The access to a global NPC (`realmId: null`, spec 073, decision 1 of the extension): every user reads it and only
 * an admin manages it. The owner and `accessType` give nothing.
 */
export function resolveGlobalNpcAccess(roles: readonly string[]): NpcAccess {
  return roles.includes(RMU_ADMIN) ? 'manage' : 'read';
}

/** The access to an NPC: of its realm when it has one (`realmLevels` holds the realms the user reads), global otherwise. */
export function resolveNpcAccessFor(
  npc: { realmId?: string | null; accessType?: AccessType | null },
  realmLevels: ReadonlyMap<string, NpcAccessLevel>,
  roles: readonly string[],
): NpcAccessLevel {
  if (!npc.realmId) return resolveGlobalNpcAccess(roles);
  return resolveNpcAccess(npc, realmLevels.get(npc.realmId) ?? 'none', roles);
}
