import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundError, ValidationError } from '../../../../shared/domain/errors';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';
import type { AttackTablePort } from '../../ports/attack-table.port';
import type { NpcEventBusPort } from '../../ports/npc.event-bus.port';
import type { NpcRepository } from '../../ports/npc.repository';
import { AddAttackCommand } from '../commands/add-attack.command';

@CommandHandler(AddAttackCommand)
export class AddAttackHandler implements ICommandHandler<AddAttackCommand, Npc> {
  constructor(
    @Inject('NpcRepository') private readonly repo: NpcRepository,
    @Inject('AttackTablePort') private readonly attackTablePort: AttackTablePort,
    @Inject('NpcEventBus') private readonly eventBus: NpcEventBusPort,
  ) {}

  async execute(command: AddAttackCommand): Promise<Npc> {
    await this.validate(command);

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

  private async validate(command: AddAttackCommand): Promise<void> {
    const attackTables = await this.attackTablePort.getAttackTables();
    if (!attackTables.includes(command.attackTable)) {
      throw new ValidationError(`Attack table ${command.attackTable} does not exist`);
    }
  }
}
