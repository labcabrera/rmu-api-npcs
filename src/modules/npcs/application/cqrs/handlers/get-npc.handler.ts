import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import type { NpcRepository } from '../../ports/npc.repository';
import { GetNpcQuery } from '../queries/get-npc.query';

@QueryHandler(GetNpcQuery)
export class GetNpcHandler implements IQueryHandler<GetNpcQuery> {
  constructor(@Inject('NpcRepository') private readonly repo: NpcRepository) {}
  async execute(query: GetNpcQuery): Promise<Npc> {
    const npc = await this.repo.findById(query.id);
    if (!npc) {
      throw new NotFoundError('NPC', query.id);
    }
    return npc;
  }
}
