import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
//TODO infra import
import { KafkaEventBus } from '../../../infrastructure/messaging/kafka.event-bus';

type NpcEvents =
  | { type: 'npc.created'; occurredAt: Date; payload: { id: string; name: string } }
  | { type: 'npc.renamed'; occurredAt: Date; payload: { id: string; name: string } }
  | { type: 'npc.skill.added'; occurredAt: Date; payload: { id: string; skill: { name: string; level: number } } };

@EventsHandler()
@Injectable()
export class NpcDomainEventsForwarder implements IEventHandler<NpcEvents> {
  constructor(private readonly kafka: KafkaEventBus) {}
  async handle(event: NpcEvents) {
    // en este punto ya persistimos el agregado; ahora publicamos a Kafka
    await this.kafka.publish(event.type, event);
  }
}
