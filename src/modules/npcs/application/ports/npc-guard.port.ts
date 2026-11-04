import type { QueryCriteria } from '../../../shared/application/criteria/query-criteria.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';
import type { Npc } from '../../domain/aggregates/npc.aggregate.js';
import type { NpcAccess, NpcAccessLevel } from '../../domain/services/npc-access.js';

export const NPC_GUARD = Symbol('NpcGuardPort');

/**
 * Permissions of NPCs (spec 073): an NPC is a child of its realm and takes the level the user has on it, from core.
 * The checks answer the level of the user, which the responses carry in `access`.
 */
export interface NpcGuardPort {
  /** Needs rmu-user or rmu-admin. */
  checkCreate(roles: string[]): void;

  /** Creating in a realm needs `write` on it: 400 `realm-not-readable` without read, 403 `realm-not-writable` with read only. */
  checkCreateInRealm(realmId: string, userId: string, roles: string[]): Promise<void>;

  /** Only an admin makes an NPC public, that is, part of the catalog (spec 054). */
  checkAccessType(accessType: AccessType, roles: string[]): void;

  checkRead(npc: Npc, userId: string, roles: string[]): Promise<NpcAccess>;

  checkUpdate(npc: Npc, userId: string, roles: string[]): Promise<NpcAccess>;

  checkDelete(npc: Npc, userId: string, roles: string[]): Promise<NpcAccess>;

  /** The level of the user on any NPC, resolved with one question to core for the whole list. */
  accessResolver(userId: string, roles: string[]): Promise<(npc: Npc) => NpcAccessLevel>;

  /** The filter of the lists: every NPC for an admin; the global ones and those of the realms the user reads for the rest. */
  buildQueryPredicate(userId: string, roles: string[]): Promise<QueryCriteria>;
}
