import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { ENCOUNTER_SETTINGS_ID, type EncounterSettings } from '../../../domain/value-objects/encounter-table.vo.js';
import { type EncounterSettingsRepository, ENCOUNTER_SETTINGS_REPOSITORY } from '../../ports/encounter-settings-repository.port.js';
import { GetEncounterSettingsQuery } from '../queries/encounter.queries.js';

/** The settings document, or 404 while the data script has not imported it. */
export async function loadEncounterSettings(repository: EncounterSettingsRepository): Promise<EncounterSettings> {
  const settings = await repository.findById(ENCOUNTER_SETTINGS_ID);
  if (!settings) throw new NotFoundError('Encounter settings', ENCOUNTER_SETTINGS_ID, 'encounter-settings-not-found');
  return settings;
}

@QueryHandler(GetEncounterSettingsQuery)
export class GetEncounterSettingsHandler implements IQueryHandler<GetEncounterSettingsQuery, EncounterSettings> {
  constructor(@Inject(ENCOUNTER_SETTINGS_REPOSITORY) private readonly repository: EncounterSettingsRepository) {}

  execute(): Promise<EncounterSettings> {
    return loadEncounterSettings(this.repository);
  }
}
