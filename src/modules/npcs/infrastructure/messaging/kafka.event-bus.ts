import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaEventBus implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({ clientId: 'npc-api', brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
  private producer: Producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
  }
  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publish(topic: string, message: unknown) {
    await this.producer.send({
      topic,
      messages: [{ key: (message as any)?.payload?.id ?? undefined, value: JSON.stringify(message) }],
    });
  }
}
