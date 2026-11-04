import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { type NpcRepository, NPC_REPOSITORY } from '../../ports/npc-repository.port.js';
import { type NpcGuardPort, NPC_GUARD } from '../../ports/npc-guard.port.js';
import { GetNpcsQuery } from '../queries/get-npcs.query.js';
import type { NpcView } from '../npc-view.js';
import { Page } from '../../../../shared/application/pagination/page.js';
import type { NpcAccess } from '../../../domain/services/npc-access.js';

@QueryHandler(GetNpcsQuery)
export class GetNpcsHandler implements IQueryHandler<GetNpcsQuery, Page<NpcView>> {
  constructor(
    @Inject(NPC_REPOSITORY) private readonly npcRepository: NpcRepository,
    @Inject(NPC_GUARD) private readonly npcGuard: NpcGuardPort,
  ) {}

  /** The NPCs of the realms the user reads (spec 073, decision 7), each with its access from the same realm levels. */
  async execute(query: GetNpcsQuery): Promise<Page<NpcView>> {
    const filter = await this.npcGuard.buildQueryPredicate(query.userId, query.roles);
    const accessOf = await this.npcGuard.accessResolver(query.userId, query.roles);
    const page = await this.npcRepository.findByRsql(query.rsql, query.page, query.size, filter);
    // The filter only lets in NPCs of readable realms, so none of them is `none`.
    const content = page.content.map(npc => ({ npc, access: accessOf(npc) as NpcAccess }));
    return new Page<NpcView>(content, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }
}
