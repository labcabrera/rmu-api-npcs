import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import type { NpcRepository } from '../../ports/npc.repository';
import { CreateNpcCommand } from '../commands/create-npc.command';

@CommandHandler(CreateNpcCommand)
export class CreateNpcHandler implements ICommandHandler<CreateNpcCommand, Npc> {
  constructor(
    @Inject('NpcRepository') private readonly repo: NpcRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateNpcCommand): Promise<Npc> {
    const npc = Npc.create({
      name: command.name,
      level: command.level,
      skills: command.skills,
      attacks: command.attacks,
      owner: command.userId,
    });
    const saved = await this.repo.save(npc);
    //TODO propagate events
    return saved;
  }
}
