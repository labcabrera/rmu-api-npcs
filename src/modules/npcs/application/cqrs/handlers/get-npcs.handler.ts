import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Npc } from '../../../domain/aggregates/npc.aggregate.js';
import { type NpcRepository, NPC_REPOSITORY } from '../../ports/npc-repository.port.js';
import { type NpcGuardPort, NPC_GUARD } from '../../ports/npc-guard.port.js';
import { GetNpcsQuery } from '../queries/get-npcs.query.js';
import { Page } from '../../../../shared/application/pagination/page.js';

@QueryHandler(GetNpcsQuery)
export class GetNpcsHandler implements IQueryHandler<GetNpcsQuery, Page<Npc>> {
  constructor(
    @Inject(NPC_REPOSITORY) private readonly npcRepository: NpcRepository,
    @Inject(NPC_GUARD) private readonly npcGuard: NpcGuardPort,
  ) {}

  async execute(query: GetNpcsQuery): Promise<Page<Npc>> {
    const filter = this.npcGuard.buildQueryPredicate(query.userId, query.roles);
    return await this.npcRepository.findByRsql(query.rsql, query.page, query.size, filter);
  }
}
