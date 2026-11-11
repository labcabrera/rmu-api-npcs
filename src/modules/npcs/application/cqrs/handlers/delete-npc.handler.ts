import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { DeleteNpcCommand } from '../commands/delete-npc.command.js';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { type NpcRepository, NPC_REPOSITORY } from '../../ports/npc-repository.port.js';
import { type NpcGuardPort, NPC_GUARD } from '../../ports/npc-guard.port.js';
import { NpcDeletedEvent } from '../../../domain/events/npc.events.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';

@CommandHandler(DeleteNpcCommand)
export class DeleteNpcHandler implements ICommandHandler<DeleteNpcCommand> {
  constructor(
    @Inject(NPC_REPOSITORY) private readonly npcRepository: NpcRepository,
    @Inject(NPC_GUARD) private readonly npcGuard: NpcGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: DeleteNpcCommand): Promise<void> {
    const npc = await this.npcRepository.findById(command.id);
    if (!npc) throw new NotFoundError('Npc', command.id);
    await this.npcGuard.checkDelete(npc, command.userId, command.roles);
    this.npcGuard.checkAccessType(npc.accessType, command.roles);
    await this.npcRepository.deleteById(command.id);
    await this.eventPublisher.publish('npc', new NpcDeletedEvent(npc.getProps()));
  }
}
