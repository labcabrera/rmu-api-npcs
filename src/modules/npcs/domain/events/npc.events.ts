import { DomainEvent } from '../../../shared/domain/events/domain-event.js';
import type { NpcProps } from '../aggregates/npc-props.js';

export class NpcCreatedEvent extends DomainEvent<NpcProps> {
  constructor(data: NpcProps) {
    super('created', data);
  }
}

export class NpcUpdatedEvent extends DomainEvent<NpcProps> {
  constructor(data: NpcProps) {
    super('updated', data);
  }
}

export class NpcDeletedEvent extends DomainEvent<NpcProps> {
  constructor(data: NpcProps) {
    super('deleted', data);
  }
}
