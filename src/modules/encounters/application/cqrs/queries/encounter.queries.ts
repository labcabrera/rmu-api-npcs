import type { ResolveEncounterRequest } from '../../../domain/services/resolve-encounter.js';

export class GetEncounterTablesQuery {}

export class GetEncounterTableQuery {
  constructor(public readonly tableId: string) {}
}

export class GetEncounterSettingsQuery {}

/** Stateless: nothing is stored, so it is a query even though it goes in a POST. */
export class ResolveEncounterQuery {
  constructor(public readonly request: ResolveEncounterRequest) {}
}
