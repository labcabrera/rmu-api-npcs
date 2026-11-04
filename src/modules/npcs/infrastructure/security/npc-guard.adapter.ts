import { Injectable } from '@nestjs/common';
import { QueryCriteria } from '../../../shared/application/criteria/query-criteria.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';
import { RMU_ADMIN, RMU_USER } from '../../../shared/domain/entities/user-roles.js';
import { ForbiddenError, ValidationError } from '../../../shared/domain/errors/errors.js';
import type { NpcGuardPort } from '../../application/ports/npc-guard.port.js';
import { RealmAccessService } from '../../application/services/realm-access.service.js';
import { Npc } from '../../domain/aggregates/npc.aggregate.js';
import {
  atLeast,
  type NpcAccess,
  type NpcAccessLevel,
  resolveGlobalNpcAccess,
  resolveNpcAccessFor,
} from '../../domain/services/npc-access.js';

/**
 * Permissions of NPCs (spec 073): the level on the realm decides, through resolveNpcAccess. `read` reads and lists,
 * `write` creates in the realm, changes and deletes; public NPCs (the catalog) stay read-only for everyone but admins.
 * A global NPC (`realmId: null`) is read by everyone and managed only by admins, without asking core.
 */
@Injectable()
export class NpcGuardAdapter implements NpcGuardPort {
  constructor(private readonly realmAccess: RealmAccessService) {}

  checkCreate(roles: string[]): void {
    if (roles.includes(RMU_ADMIN) || roles.includes(RMU_USER)) return;
    throw new ForbiddenError('You do not have permission to create this entity');
  }

  async checkCreateInRealm(realmId: string, userId: string, roles: string[]): Promise<void> {
    const level = await this.realmAccess.levelOf(realmId, userId, roles);
    if (level === 'none') throw new ValidationError('You cannot read the realm of the NPC', 'realm-not-readable');
    if (!atLeast(level, 'write')) throw new ForbiddenError('You cannot write in the realm of the NPC', 'realm-not-writable');
  }

  checkAccessType(accessType: AccessType, roles: string[]): void {
    if (accessType === 'public' && !roles.includes(RMU_ADMIN)) {
      throw new ForbiddenError('Only an admin can make an NPC public');
    }
  }

  checkRead(npc: Npc, userId: string, roles: string[]): Promise<NpcAccess> {
    return this.require(npc, userId, roles, 'read', 'read');
  }

  checkUpdate(npc: Npc, userId: string, roles: string[]): Promise<NpcAccess> {
    return this.require(npc, userId, roles, 'write', 'update');
  }

  checkDelete(npc: Npc, userId: string, roles: string[]): Promise<NpcAccess> {
    return this.require(npc, userId, roles, 'write', 'delete');
  }

  async accessResolver(userId: string, roles: string[]): Promise<(npc: Npc) => NpcAccessLevel> {
    if (roles.includes(RMU_ADMIN)) return () => 'manage';
    const levels = await this.realmAccess.levels(userId);
    return npc => resolveNpcAccessFor(npc, levels, roles);
  }

  async buildQueryPredicate(userId: string, roles: string[]): Promise<QueryCriteria> {
    if (roles.includes(RMU_ADMIN)) return QueryCriteria.empty();
    // `realmId: null` also matches documents without the field: the global NPCs.
    const global = QueryCriteria.eq('realmId', null);
    const realmIds = await this.realmAccess.readableRealmIds(userId);
    if (realmIds.length === 0) return global;
    return QueryCriteria.anyOf([global, QueryCriteria.in('realmId', realmIds)]);
  }

  private async require(npc: Npc, userId: string, roles: string[], required: NpcAccess, action: string): Promise<NpcAccess> {
    // A global NPC needs no question to core.
    const level = npc.realmId ? (await this.accessResolver(userId, roles))(npc) : resolveGlobalNpcAccess(roles);
    if (level !== 'none' && atLeast(level, required)) return level;
    throw new ForbiddenError(`You do not have permission to ${action} this entity`);
  }
}
