import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import type { NpcEventBusPort } from '../../ports/npc-event-bus.port';
import type { NpcRepository } from '../../ports/npc.repository';
import { CreateNpcCommand } from '../commands/create-npc.command';

@CommandHandler(CreateNpcCommand)
export class CreateNpcHandler implements ICommandHandler<CreateNpcCommand, Npc> {
  constructor(
    @Inject('NpcRepository') private readonly repo: NpcRepository,
    @Inject('NpcEventBus') private readonly eventBus: NpcEventBusPort,
  ) {}

  async execute(command: CreateNpcCommand): Promise<Npc> {
    const npc = Npc.create({
      realmId: command.realmId,
      category: command.category,
      name: command.name,
      level: command.level,
      db: command.db || 0,
      at: command.at || 1,
      skills: command.skills || [],
      items: command.items || [],
      attacks: command.attacks || [],
      description: command.description,
      imageUrl: command.imageUrl,
      owner: command.userId,
    });
    const saved = await this.repo.save(npc);
    npc.getUncommittedEvents().forEach((event) => this.eventBus.publish(event));
    return saved;
  }
}
