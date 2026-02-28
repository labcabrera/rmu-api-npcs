import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from 'src/modules/auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { AddAttackHandler } from './application/cqrs/handlers/add-attack.handler';
import { AddSkillHandler } from './application/cqrs/handlers/add-skill.handler';
import { CreateNpcHandler } from './application/cqrs/handlers/create-npc.handler';
import { DeleteAttackHandler } from './application/cqrs/handlers/delete-attack.handler';
import { DeleteNpcHandler } from './application/cqrs/handlers/delete-npc.handler';
import { DeleteSkillHandler } from './application/cqrs/handlers/delete-skill.handler';
import { GetNpcHandler } from './application/cqrs/handlers/get-npc.handler';
import { GetNpcsHandler } from './application/cqrs/handlers/get-npcs.handler';
import { UpdateNpcHandler } from './application/cqrs/handlers/update-npc.handler';
import { ApiAttackTableAdapter } from './infrastructure/api-client/attack-table.adapter';
import { MongoNpcRepository } from './infrastructure/db/mongo.npc.repository';
import { KafkaNpcEventBusAdapter } from './infrastructure/messaging/kafka.npc-event-bus.adapter';
import { NpcModel, NpcSchema } from './infrastructure/persistence/models/npc.model';
import { NpcAttackController } from './interfaces/http/npc-attack.controller';
import { NpcSkillController } from './interfaces/http/npc-skill.controller';
import { NpcController } from './interfaces/http/npc.controller';

const CommandHandlers = [
  CreateNpcHandler,
  UpdateNpcHandler,
  DeleteNpcHandler,
  AddSkillHandler,
  DeleteSkillHandler,
  AddAttackHandler,
  DeleteAttackHandler,
];
const QueryHandlers = [GetNpcHandler, GetNpcsHandler];

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    MongooseModule.forFeature([{ name: NpcModel.name, schema: NpcSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [NpcController, NpcSkillController, NpcAttackController],
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
    {
      provide: 'AttackTablePort',
      useClass: ApiAttackTableAdapter,
    },
  ],
  exports: [],
})
export class NpcsModule {}
