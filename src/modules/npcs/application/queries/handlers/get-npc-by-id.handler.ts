import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as npcRepository from '../../../domain/ports/npc.repository';
import { GetNpcByIdQuery } from '../get-npc-by-id.query';

@QueryHandler(GetNpcByIdQuery)
export class GetNpcByIdHandler implements IQueryHandler<GetNpcByIdQuery> {
  constructor(@Inject('NpcRepository') private readonly repo: npcRepository.NpcRepository) {}
  async execute({ id }: GetNpcByIdQuery) {
    const npc = await this.repo.findById(id);
    if (!npc) throw new NotFoundException('NPC not found');
    return {
      id: npc.id,
      name: npc.name,
      skills: npc.skills, // si prefieres, mapea a DTO plano
      attacks: npc.attacks,
    };
  }
}
