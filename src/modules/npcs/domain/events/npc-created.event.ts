import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { NpcProps } from '../aggregates/npc.aggregate';

export class NpcCreatedEvent extends DomainEvent<NpcProps> {
  constructor(data: NpcProps) {
    super('created', data);
  }
}
