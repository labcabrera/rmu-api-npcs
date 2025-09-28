import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { NpcProps } from '../aggregates/npc.aggregate';

export class NpcUpdatedEvent extends DomainEvent<NpcProps> {
  constructor(data: NpcProps) {
    super('updated', data);
  }
}
