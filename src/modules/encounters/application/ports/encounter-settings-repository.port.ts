import type { EncounterSettings } from '../../domain/value-objects/encounter-table.vo.js';

/** Read-only: the settings (Tables 15.4a-c) are imported by the data script (spec 061). */
export interface EncounterSettingsRepository {
  findById(id: string): Promise<EncounterSettings | null>;
}

export const ENCOUNTER_SETTINGS_REPOSITORY = Symbol('EncounterSettingsRepository');
