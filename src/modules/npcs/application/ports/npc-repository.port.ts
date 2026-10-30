import { Npc } from '../../domain/aggregates/npc.aggregate.js';
import type { BaseRepository } from '../../../shared/application/ports/base-repository.port.js';

export type NpcRepository = BaseRepository<Npc>;

export const NPC_REPOSITORY = Symbol('NpcRepository');
