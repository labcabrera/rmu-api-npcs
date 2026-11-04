import { Npc } from '../../domain/aggregates/npc.aggregate.js';
import type { BaseRepository } from '../../../shared/application/ports/base-repository.port.js';

export interface NpcRepository extends BaseRepository<Npc> {
  /** Every NPC of a realm, for the cascade of a deleted realm (spec 073, decision 9). */
  findByRealm(realmId: string): Promise<Npc[]>;
}

export const NPC_REPOSITORY = Symbol('NpcRepository');
