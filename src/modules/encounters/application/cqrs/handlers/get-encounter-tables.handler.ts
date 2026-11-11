import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { EncounterTableSummary } from '../../../domain/value-objects/encounter-table.vo.js';
import { type EncounterTableRepository, ENCOUNTER_TABLE_REPOSITORY } from '../../ports/encounter-table-repository.port.js';
import { GetEncounterTablesQuery } from '../queries/encounter.queries.js';

@QueryHandler(GetEncounterTablesQuery)
export class GetEncounterTablesHandler implements IQueryHandler<GetEncounterTablesQuery, EncounterTableSummary[]> {
  constructor(@Inject(ENCOUNTER_TABLE_REPOSITORY) private readonly repository: EncounterTableRepository) {}

  execute(): Promise<EncounterTableSummary[]> {
    return this.repository.findSummaries();
  }
}
