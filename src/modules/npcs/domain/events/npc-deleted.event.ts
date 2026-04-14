import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { NpcProps } from '../aggregates/npc-props';

export class NpcDeletedEvent extends DomainEvent<NpcProps> {
  constructor(data: NpcProps) {
    super('deleted', data);
  }
}
