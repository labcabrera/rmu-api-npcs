import type { EncounterTable, EncounterTableSummary } from '../../domain/value-objects/encounter-table.vo.js';

/** Read-only: the tables are imported by the data script (spec 061). */
export interface EncounterTableRepository {
  /** Every table without rows, sorted by kind and id. */
  findSummaries(): Promise<EncounterTableSummary[]>;
  findAll(): Promise<EncounterTable[]>;
  findById(id: string): Promise<EncounterTable | null>;
}

export const ENCOUNTER_TABLE_REPOSITORY = Symbol('EncounterTableRepository');
