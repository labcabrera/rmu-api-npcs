import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { type DomainEventPublisher, DOMAIN_EVENT_PUBLISHER } from '../../../../shared/application/ports/domain-event-publisher.port.js';
import { NpcDeletedEvent } from '../../../domain/events/npc.events.js';
import { type NpcRepository, NPC_REPOSITORY } from '../../ports/npc-repository.port.js';
import { DeleteNpcsByRealmCommand } from '../commands/delete-npcs-by-realm.command.js';

/**
 * Deletes the NPCs of a deleted realm one at a time, publishing an npc.deleted per NPC like DeleteNpcHandler.
 * Idempotent: a repeated message no longer finds any NPC.
 */
@CommandHandler(DeleteNpcsByRealmCommand)
export class DeleteNpcsByRealmHandler implements ICommandHandler<DeleteNpcsByRealmCommand, void> {
  private readonly logger = new Logger(DeleteNpcsByRealmHandler.name);

  constructor(
    @Inject(NPC_REPOSITORY) private readonly npcRepository: NpcRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(command: DeleteNpcsByRealmCommand): Promise<void> {
    const npcs = await this.npcRepository.findByRealm(command.realmId);
    this.logger.log(`Deleting ${npcs.length} NPCs of realm ${command.realmId}`);
    for (const npc of npcs) {
      // Null when a concurrent delivery got it first: nothing to publish then.
      const deleted = await this.npcRepository.deleteById(npc.id);
      if (deleted) await this.eventPublisher.publish('npc', new NpcDeletedEvent(npc.getProps()));
    }
  }
}
