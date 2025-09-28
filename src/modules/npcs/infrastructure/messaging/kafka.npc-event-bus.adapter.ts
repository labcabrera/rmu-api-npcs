import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from 'src/modules/shared/domain/events/domain-event';
import { KafkaProducerService } from 'src/modules/shared/infrastructure/messaging/kafka-producer.service';
import { NpcEventBusPort } from '../../application/ports/npc-event-bus.port';
import { NpcProps } from '../../domain/aggregates/npc.aggregate';

@Injectable()
export class KafkaNpcEventBusAdapter implements NpcEventBusPort {
  private readonly logger = new Logger(KafkaNpcEventBusAdapter.name);

  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  publish(event: DomainEvent<NpcProps>): void {
    this.kafkaProducerService.emit(`internal.rmu-npcs.npc.${event.eventType}.v1`, event).catch((err) => {
      this.logger.error('Error publishing event to Kafka', err);
    });
  }
}
