import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import * as npcRepository from '../../../domain/ports/npc.repository';
import { CreateNpcCommand } from '../create-npc.command';

@CommandHandler(CreateNpcCommand)
export class CreateNpcHandler implements ICommandHandler<CreateNpcCommand> {
  constructor(
    @Inject('NpcRepository') private readonly repo: npcRepository.NpcRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ id, name }: CreateNpcCommand) {
    const npc = Npc.create({ id, name });
    await this.repo.save(npc);
    // reenviar eventos de dominio como eventos de aplicación
    for (const evt of npc.pullEvents()) this.eventBus.publish(evt as any);
    return { id, name };
  }
}
