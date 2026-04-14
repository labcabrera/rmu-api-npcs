import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { NpcProps } from '../../domain/aggregates/npc-props';

export interface NpcEventBusPort {
  publish(event: DomainEvent<NpcProps>): void;
}
