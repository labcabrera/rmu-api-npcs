import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../shared/infrastructure/security/auth.module.js';
import { SharedModule } from '../shared/shared.module.js';
import { CreateNpcHandler } from './application/cqrs/handlers/create-npc.handler.js';
import { DeleteNpcHandler } from './application/cqrs/handlers/delete-npc.handler.js';
import { DeleteNpcsByRealmHandler } from './application/cqrs/handlers/delete-npcs-by-realm.handler.js';
import { GetNpcHandler } from './application/cqrs/handlers/get-npc.handler.js';
import { GetNpcsHandler } from './application/cqrs/handlers/get-npcs.handler.js';
import { UpdateNpcHandler } from './application/cqrs/handlers/update-npc.handler.js';
import { NPC_GUARD } from './application/ports/npc-guard.port.js';
import { NPC_REPOSITORY } from './application/ports/npc-repository.port.js';
import { REALM_PORT } from './application/ports/realm.port.js';
import { RealmAccessService } from './application/services/realm-access.service.js';
import { ApiRealmAdapter } from './infrastructure/api-clients/api.realm.adapter.js';
import { MongoNpcRepository } from './infrastructure/db/mongo.npc.repository.js';
import { NpcModel, NpcSchema } from './infrastructure/persistence/models/npc.model.js';
import { NpcGuardAdapter } from './infrastructure/security/npc-guard.adapter.js';
import { NpcController } from './interfaces/http/npc.controller.js';
import { KafkaRealmEventConsumer } from './interfaces/messaging/kafka.realm-event-consumer.js';

@Module({
  imports: [CqrsModule, MongooseModule.forFeature([{ name: NpcModel.name, schema: NpcSchema }]), AuthModule, SharedModule],
  controllers: [NpcController, KafkaRealmEventConsumer],
  providers: [
    GetNpcHandler,
    GetNpcsHandler,
    CreateNpcHandler,
    UpdateNpcHandler,
    DeleteNpcHandler,
    DeleteNpcsByRealmHandler,
    RealmAccessService,
    { provide: NPC_REPOSITORY, useClass: MongoNpcRepository },
    { provide: NPC_GUARD, useClass: NpcGuardAdapter },
    { provide: REALM_PORT, useClass: ApiRealmAdapter },
  ],
})
export class NpcsModule {}
