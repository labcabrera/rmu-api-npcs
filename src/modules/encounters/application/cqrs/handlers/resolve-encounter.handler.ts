import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { resolveEncounter, type ResolveEncounterResponse } from '../../../domain/services/resolve-encounter.js';
import { type EncounterSettingsRepository, ENCOUNTER_SETTINGS_REPOSITORY } from '../../ports/encounter-settings-repository.port.js';
import { type EncounterTableRepository, ENCOUNTER_TABLE_REPOSITORY } from '../../ports/encounter-table-repository.port.js';
import { ResolveEncounterQuery } from '../queries/encounter.queries.js';
import { loadEncounterSettings } from './get-encounter-settings.handler.js';

/** Loads the tables (a few dozen documents) and the settings, and leaves the rules to the domain service. */
@QueryHandler(ResolveEncounterQuery)
export class ResolveEncounterHandler implements IQueryHandler<ResolveEncounterQuery, ResolveEncounterResponse> {
  constructor(
    @Inject(ENCOUNTER_TABLE_REPOSITORY) private readonly tables: EncounterTableRepository,
    @Inject(ENCOUNTER_SETTINGS_REPOSITORY) private readonly settings: EncounterSettingsRepository,
  ) {}

  async execute(query: ResolveEncounterQuery): Promise<ResolveEncounterResponse> {
    const [tables, settings] = await Promise.all([this.tables.findAll(), loadEncounterSettings(this.settings)]);
    const byId = new Map(tables.map(table => [table.id, table]));
    return resolveEncounter(query.request, id => byId.get(id), settings);
  }
}
