import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Npc } from '../../../domain/aggregates/npc.aggregate.js';
import { CreateNpcCommand } from '../commands/create-npc.command.js';
import type { NpcView } from '../npc-view.js';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { type NpcRepository, NPC_REPOSITORY } from '../../ports/npc-repository.port.js';
import { type NpcGuardPort, NPC_GUARD } from '../../ports/npc-guard.port.js';
import { type RealmPort, REALM_PORT } from '../../ports/realm.port.js';
import { ValidationError } from '../../../../shared/domain/errors/errors.js';

@CommandHandler(CreateNpcCommand)
export class CreateNpcHandler implements ICommandHandler<CreateNpcCommand, NpcView> {
  constructor(
    @Inject(NPC_REPOSITORY) private readonly npcRepository: NpcRepository,
    @Inject(NPC_GUARD) private readonly npcGuard: NpcGuardPort,
    @Inject(REALM_PORT) private readonly realmPort: RealmPort,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: CreateNpcCommand): Promise<NpcView> {
    this.npcGuard.checkCreate(command.roles);
    this.npcGuard.checkAccessType(command.props.accessType, command.roles);
    // Before asking core for the realm, so invalid data is a 400 without a call.
    const npc = Npc.create({ ...command.props, owner: command.userId });
    const realm = await this.realmPort.fetchRealmById(command.props.realmId);
    if (!realm) throw new ValidationError(`Realm ${command.props.realmId} does not exist`);
    // Spec 073, decision 4: the user must write in the realm (an admin writes in them all).
    await this.npcGuard.checkCreateInRealm(command.props.realmId, command.userId, command.roles);
    const saved = await this.npcRepository.save(npc);
    await this.eventPublisher.publishChanges('npc', npc);
    // Only an admin creates a public NPC, so a user who writes in the realm gets `write`.
    return { npc: saved, access: await this.npcGuard.checkRead(saved, command.userId, command.roles) };
  }
}
