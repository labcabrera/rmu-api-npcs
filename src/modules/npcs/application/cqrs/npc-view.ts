import type { Npc } from '../../domain/aggregates/npc.aggregate.js';
import type { NpcAccess } from '../../domain/services/npc-access.js';

/** An NPC with what the user who asked can do with it (spec 073, decision 8). */
export interface NpcView {
  npc: Npc;
  access: NpcAccess;
}
