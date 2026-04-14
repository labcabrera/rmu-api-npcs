import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { NpcProps } from '../aggregates/npc-props';

export class NpcUpdatedEvent extends DomainEvent<NpcProps> {
  constructor(data: NpcProps) {
    super('updated', data);
  }
}
