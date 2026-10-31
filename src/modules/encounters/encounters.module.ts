import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../shared/infrastructure/security/auth.module.js';
import { GetEncounterSettingsHandler } from './application/cqrs/handlers/get-encounter-settings.handler.js';
import { GetEncounterTableHandler } from './application/cqrs/handlers/get-encounter-table.handler.js';
import { GetEncounterTablesHandler } from './application/cqrs/handlers/get-encounter-tables.handler.js';
import { ResolveEncounterHandler } from './application/cqrs/handlers/resolve-encounter.handler.js';
import { ENCOUNTER_SETTINGS_REPOSITORY } from './application/ports/encounter-settings-repository.port.js';
import { ENCOUNTER_TABLE_REPOSITORY } from './application/ports/encounter-table-repository.port.js';
import { MongoEncounterSettingsRepository } from './infrastructure/db/mongo.encounter-settings.repository.js';
import { MongoEncounterTableRepository } from './infrastructure/db/mongo.encounter-table.repository.js';
import { EncounterSettingsModel, EncounterSettingsSchema } from './infrastructure/persistence/models/encounter-settings.model.js';
import { EncounterTableModel, EncounterTableSchema } from './infrastructure/persistence/models/encounter-table.model.js';
import { EncounterController } from './interfaces/http/encounter.controller.js';

/** Encounter tables, settings and the resolution of the rolls (spec 061). */
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: EncounterTableModel.name, schema: EncounterTableSchema },
      { name: EncounterSettingsModel.name, schema: EncounterSettingsSchema },
    ]),
    AuthModule,
  ],
  controllers: [EncounterController],
  providers: [
    GetEncounterTablesHandler,
    GetEncounterTableHandler,
    GetEncounterSettingsHandler,
    ResolveEncounterHandler,
    { provide: ENCOUNTER_TABLE_REPOSITORY, useClass: MongoEncounterTableRepository },
    { provide: ENCOUNTER_SETTINGS_REPOSITORY, useClass: MongoEncounterSettingsRepository },
  ],
})
export class EncountersModule {}
