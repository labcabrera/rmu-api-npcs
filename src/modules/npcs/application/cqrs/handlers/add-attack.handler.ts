import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';
import type { NpcEventBusPort } from '../../ports/npc-event-bus.port';
import type { NpcRepository } from '../../ports/npc.repository';
import { AddAttackCommand } from '../commands/add-attack.command';

@CommandHandler(AddAttackCommand)
export class AddAttackHandler implements ICommandHandler<AddAttackCommand, Npc> {
  constructor(
    @Inject('NpcRepository') private readonly repo: NpcRepository,
    @Inject('NpcEventBus') private readonly eventBus: NpcEventBusPort,
  ) {}

  async execute(command: AddAttackCommand): Promise<Npc> {
    const npc = await this.repo.findById(command.npcId);
    if (!npc) throw new NotFoundError('Npc', command.npcId);

    const npcAttack = new NpcAttack(
      command.attackName,
      command.attackType,
      command.attackTable,
      command.fumbleTable,
      command.attackSize,
      command.bo,
      command.fumble,
    );
    npc.addAttack(npcAttack);
    const saved = await this.repo.update(npc.id, npc);
    npc.getUncommittedEvents().forEach((event) => this.eventBus.publish(event));
    return saved;
  }
}
