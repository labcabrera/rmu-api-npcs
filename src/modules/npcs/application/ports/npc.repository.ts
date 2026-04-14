import { BaseRepository } from '../../../shared/application/ports/base-repository';
import { Npc } from '../../domain/aggregates/npc.aggregate';

export type NpcRepository = BaseRepository<Npc>;
