import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from 'src/modules/auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { AddSkillHandler } from './application/cqrs/handlers/add-skill.handler';
import { CreateNpcHandler } from './application/cqrs/handlers/create-npc.handler';
import { GetNpcHandler } from './application/cqrs/handlers/get-npc.handler';
import { Npc } from './domain/aggregates/npc.aggregate';
import { MongoNpcRepository } from './infrastructure/db/mongo.npc.repository';
import { KafkaEventBus } from './infrastructure/messaging/kafka.event-bus';
import { NpcSchema } from './infrastructure/persistence/models/npc.model';

const CommandHandlers = [CreateNpcHandler, AddSkillHandler];
const QueryHandlers = [GetNpcHandler];

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: Npc.name, schema: NpcSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    KafkaEventBus,
    {
      provide: 'NpcRepository',
      useClass: MongoNpcRepository,
    },
  ],
  exports: [],
})
export class NpcsModule {}
