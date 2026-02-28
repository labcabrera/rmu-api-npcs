import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import type { NpcEventBusPort } from '../../ports/npc.event-bus.port';
import type { NpcRepository } from '../../ports/npc.repository';
import { DeleteAttackCommand } from '../commands/delete-attack.command';

@CommandHandler(DeleteAttackCommand)
export class DeleteAttackHandler implements ICommandHandler<DeleteAttackCommand, Npc> {
  constructor(
    @Inject('NpcRepository') private readonly repo: NpcRepository,
    @Inject('NpcEventBus') private readonly eventBus: NpcEventBusPort,
  ) {}

  async execute(command: DeleteAttackCommand): Promise<Npc> {
    const npc = await this.repo.findById(command.npcId);
    if (!npc) throw new NotFoundError('Npc', command.npcId);

    npc.deleteAttack(command.attackName);
    const saved = await this.repo.update(npc.id, npc);
    npc.getUncommittedEvents().forEach((event) => this.eventBus.publish(event));
    return saved;
  }
}
