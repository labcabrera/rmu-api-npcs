import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AddSkillHandler } from './application/commands/handlers/add-skill.handler';
import { CreateNpcHandler } from './application/commands/handlers/create-npc.handler';
import { NpcDomainEventsForwarder } from './application/events/handlers/npc-domain-events.forwarder';
import { GetNpcByIdHandler } from './application/queries/handlers/get-npc-by-id.handler';
import { KafkaEventBus } from './infrastructure/messaging/kafka.event-bus';
import { MongooseNpcRepository } from './infrastructure/persistence/npc.repository.mongoose';

const CommandHandlers = [CreateNpcHandler, AddSkillHandler];
const QueryHandlers = [GetNpcByIdHandler];
const EventHandlers = [NpcDomainEventsForwarder];

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    ConfigModule,
    //MongooseModule.forFeature([{ name: GameModel.name, schema: GameSchema }]),
    AuthModule,
  ],
  controllers: [],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    KafkaEventBus,
    {
      provide: 'NpcRepository',
      useClass: MongooseNpcRepository,
    },
  ],
  exports: [],
})
export class NpcsModule {}
