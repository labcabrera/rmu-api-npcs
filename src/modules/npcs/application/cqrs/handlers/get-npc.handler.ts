import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Npc } from '../../../domain/aggregates/npc.aggregate.js';
import { GetNpcQuery } from '../queries/get-npc.query.js';
import { type NpcRepository, NPC_REPOSITORY } from '../../ports/npc-repository.port.js';
import { type NpcGuardPort, NPC_GUARD } from '../../ports/npc-guard.port.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';

@QueryHandler(GetNpcQuery)
export class GetNpcHandler implements IQueryHandler<GetNpcQuery, Npc> {
  constructor(
    @Inject(NPC_REPOSITORY) private readonly npcRepository: NpcRepository,
    @Inject(NPC_GUARD) private readonly npcGuard: NpcGuardPort,
  ) {}

  async execute(query: GetNpcQuery): Promise<Npc> {
    const npc = await this.npcRepository.findById(query.npcId);
    if (!npc) throw new NotFoundError('Npc', query.npcId);
    this.npcGuard.checkRead(npc, query.userId, query.roles);
    return npc;
  }
}
