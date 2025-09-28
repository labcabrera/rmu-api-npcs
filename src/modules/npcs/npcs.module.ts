import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from 'src/modules/auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { AddSkillHandler } from './application/cqrs/handlers/add-skill.handler';
import { CreateNpcHandler } from './application/cqrs/handlers/create-npc.handler';
import { DeleteNpcHandler } from './application/cqrs/handlers/delete-npc.handler';
import { GetNpcHandler } from './application/cqrs/handlers/get-npc.handler';
import { GetNpcsHandler } from './application/cqrs/handlers/get-npcs.handler';
import { MongoNpcRepository } from './infrastructure/db/mongo.npc.repository';
import { KafkaNpcEventBusAdapter } from './infrastructure/messaging/kafka.npc-event-bus.adapter';
import { NpcModel, NpcSchema } from './infrastructure/persistence/models/npc.model';
import { NpcController } from './interfaces/http/npc.controller';

const CommandHandlers = [CreateNpcHandler, AddSkillHandler, DeleteNpcHandler];
const QueryHandlers = [GetNpcHandler, GetNpcsHandler];

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: NpcModel.name, schema: NpcSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [NpcController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: 'NpcRepository',
      useClass: MongoNpcRepository,
    },
    {
      provide: 'NpcEventBus',
      useClass: KafkaNpcEventBusAdapter,
    },
  ],
  exports: [],
})
export class NpcsModule {}
