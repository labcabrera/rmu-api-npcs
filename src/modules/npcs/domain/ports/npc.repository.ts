import { Npc } from '../aggregates/npc.aggregate';
export const NPC_REPOSITORY = Symbol('NPC_REPOSITORY');

export interface NpcRepository {
  findById(id: string): Promise<Npc | null>;
  save(npc: Npc): Promise<void>; // upsert
}
