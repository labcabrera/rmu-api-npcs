import type { EntityGuard } from '../../../shared/application/ports/entity-guard.port.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';
import { Npc } from '../../domain/aggregates/npc.aggregate.js';

export const NPC_GUARD = Symbol('NpcGuardPort');

export interface NpcGuardPort extends EntityGuard<Npc> {
  /** Only an admin makes an NPC public, that is, part of the catalog (spec 054). */
  checkAccessType(accessType: AccessType, roles: string[]): void;
}
