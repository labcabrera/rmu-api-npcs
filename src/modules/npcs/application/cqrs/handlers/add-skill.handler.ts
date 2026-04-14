import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors/errors';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import type { NpcEventBusPort } from '../../ports/npc.event-bus.port';
import type { NpcRepository } from '../../ports/npc.repository';
import { AddSkillCommand } from '../commands/add-skill.command';

@CommandHandler(AddSkillCommand)
export class AddSkillHandler implements ICommandHandler<AddSkillCommand, Npc> {
  constructor(
    @Inject('NpcRepository') private readonly repo: NpcRepository,
    @Inject('NpcEventBus') private readonly eventBus: NpcEventBusPort,
  ) {}

  async execute(command: AddSkillCommand): Promise<Npc> {
    const npc = await this.repo.findById(command.npcId);
    if (!npc) throw new NotFoundError('Npc', command.npcId);

    //TODO check skill exists using core api

    npc.addSkill({
      skillId: command.skillId,
      ranks: command.ranks,
      bonus: command.bonus,
    });
    const saved = await this.repo.update(npc.id, npc);
    npc.getUncommittedEvents().forEach(event => this.eventBus.publish(event));
    return saved;
  }
}
