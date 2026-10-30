import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { UpdateNpcCommand } from '../commands/update-npc.command.js';
import { Npc } from '../../../domain/aggregates/npc.aggregate.js';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { type NpcRepository, NPC_REPOSITORY } from '../../ports/npc-repository.port.js';
import { type NpcGuardPort, NPC_GUARD } from '../../ports/npc-guard.port.js';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';

@CommandHandler(UpdateNpcCommand)
export class UpdateNpcHandler implements ICommandHandler<UpdateNpcCommand, Npc> {
  constructor(
    @Inject(NPC_REPOSITORY) private readonly npcRepository: NpcRepository,
    @Inject(NPC_GUARD) private readonly npcGuard: NpcGuardPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: UpdateNpcCommand): Promise<Npc> {
    const npc = await this.npcRepository.findById(command.id);
    if (!npc) throw new NotFoundError('Npc', command.id);
    this.npcGuard.checkUpdate(npc, command.userId, command.roles);
    // A public NPC is the catalog: only an admin changes it, and only an admin makes one public.
    this.npcGuard.checkAccessType(npc.accessType, command.roles);
    if (command.props.accessType) this.npcGuard.checkAccessType(command.props.accessType, command.roles);
    npc.checkVersion(command.expectedVersion);
    npc.update(command.props);
    // A PATCH without changes neither writes nor publishes (spec 021, decision 9).
    if (!npc.hasChanges()) return npc;
    const updated = await this.npcRepository.update(npc);
    await this.eventPublisher.publishChanges('npc', npc);
    return updated;
  }
}
