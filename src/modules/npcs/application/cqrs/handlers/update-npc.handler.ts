import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import type { NpcEventBusPort } from '../../ports/npc-event-bus.port';
import type { NpcRepository } from '../../ports/npc.repository';
import { UpdateNpcCommand } from '../commands/update-npc.command';

@CommandHandler(UpdateNpcCommand)
export class UpdateNpcHandler implements ICommandHandler<UpdateNpcCommand, Npc> {
  constructor(
    @Inject('NpcRepository') private readonly repo: NpcRepository,
    @Inject('NpcEventBus') private readonly eventBus: NpcEventBusPort,
  ) {}

  async execute(command: UpdateNpcCommand): Promise<Npc> {
    const npc = await this.repo.findById(command.id);
    if (!npc) {
      throw new NotFoundError('NPC', command.id);
    }
    npc.update({
      outlookType: command.outlookType,
      name: command.name,
      level: command.level,
      hp: command.hp,
      db: command.db,
      at: command.at,
      initiative: command.initiative,
      skills: command.skills,
      attacks: command.attacks,
      description: command.description,
      imageUrl: command.imageUrl,
    });
    const saved = await this.repo.update(npc.id, npc);
    npc.getUncommittedEvents().forEach((event) => this.eventBus.publish(event));
    return saved;
  }
}
