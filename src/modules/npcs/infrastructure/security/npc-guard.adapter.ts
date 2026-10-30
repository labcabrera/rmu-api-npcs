import { BaseEntityGuard } from '../../../shared/infrastructure/security/base-entity-guard.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';
import { RMU_ADMIN } from '../../../shared/domain/entities/user-roles.js';
import { ForbiddenError } from '../../../shared/domain/errors/errors.js';
import type { NpcGuardPort } from '../../application/ports/npc-guard.port.js';
import { Npc } from '../../domain/aggregates/npc.aggregate.js';

/**
 * Permissions of NPCs (spec 054): public NPCs are the catalog, readable by everyone and created or changed by admins
 * only; any rmu-user creates private NPCs, which only the owner or an admin read, change or delete.
 */
export class NpcGuardAdapter extends BaseEntityGuard<Npc> implements NpcGuardPort {
  checkAccessType(accessType: AccessType, roles: string[]): void {
    if (accessType === 'public' && !roles.includes(RMU_ADMIN)) {
      throw new ForbiddenError('Only an admin can make an NPC public');
    }
  }
}
