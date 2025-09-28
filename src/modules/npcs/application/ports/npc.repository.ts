import { Page } from '../../../shared/domain/entities/page.entity';
import { Npc } from '../../domain/aggregates/npc.aggregate';

export interface NpcRepository {
  findById(id: string): Promise<Npc | null>;

  findByRsql(rsql: string | undefined, page: number, size: number): Promise<Page<Npc>>;

  save(entity: Npc): Promise<Npc>;

  update(npcId: string, update: Partial<Npc>): Promise<Npc>;

  deleteById(id: string): Promise<Npc | null>;
}
