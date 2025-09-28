import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Page } from '../../../../shared/domain/entities/page.entity';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import type { NpcRepository } from '../../ports/npc.repository';
import { GetNpcsQuery } from '../queries/get-npcs.query';

@QueryHandler(GetNpcsQuery)
export class GetNpcsHandler implements IQueryHandler<GetNpcsQuery, Page<Npc>> {
  constructor(@Inject('NpcRepository') private readonly npcRepository: NpcRepository) {}
  async execute(query: GetNpcsQuery): Promise<Page<Npc>> {
    return await this.npcRepository.findByRsql(query.rsql, query.page, query.size);
  }
}
