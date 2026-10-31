import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import type { EncounterTable } from '../../../domain/value-objects/encounter-table.vo.js';
import { type EncounterTableRepository, ENCOUNTER_TABLE_REPOSITORY } from '../../ports/encounter-table-repository.port.js';
import { GetEncounterTableQuery } from '../queries/encounter.queries.js';

@QueryHandler(GetEncounterTableQuery)
export class GetEncounterTableHandler implements IQueryHandler<GetEncounterTableQuery, EncounterTable> {
  constructor(@Inject(ENCOUNTER_TABLE_REPOSITORY) private readonly repository: EncounterTableRepository) {}

  async execute(query: GetEncounterTableQuery): Promise<EncounterTable> {
    const table = await this.repository.findById(query.tableId);
    if (!table) throw new NotFoundError('Encounter table', query.tableId, 'encounter-table-not-found');
    return table;
  }
}
