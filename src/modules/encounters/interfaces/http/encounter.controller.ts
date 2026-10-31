import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/security/jwt-auth.guard.js';
import { ApiErrors } from '../../../shared/interfaces/http/api-errors.decorator.js';
import {
  GetEncounterSettingsQuery,
  GetEncounterTableQuery,
  GetEncounterTablesQuery,
  ResolveEncounterQuery,
} from '../../application/cqrs/queries/encounter.queries.js';
import type { ResolveEncounterResponse } from '../../domain/services/resolve-encounter.js';
import type { EncounterSettings, EncounterTable, EncounterTableSummary } from '../../domain/value-objects/encounter-table.vo.js';
import { EncounterSettingsDto, EncounterTableDto, EncounterTableSummaryDto } from './dto/encounter-table.dto.js';
import { ResolveEncounterDto, ResolveEncounterResponseDto } from './dto/resolve-encounter.dto.js';

/** Encounter rolls of Creature Law 15.4 (spec 061): any authenticated user, read-only on the imported tables. */
@UseGuards(JwtAuthGuard)
@Controller('v1')
@ApiTags('Encounters')
export class EncounterController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('encounter-tables')
  @ApiOperation({ operationId: 'findEncounterTables', summary: 'List the encounter tables without rows, by kind and id' })
  @ApiOkResponse({ type: [EncounterTableSummaryDto] })
  @ApiErrors()
  findTables(): Promise<EncounterTableSummary[]> {
    return this.queryBus.execute<GetEncounterTablesQuery, EncounterTableSummary[]>(new GetEncounterTablesQuery());
  }

  @Get('encounter-tables/:id')
  @ApiOperation({ operationId: 'findEncounterTableById', summary: 'Find an encounter table with its rows' })
  @ApiOkResponse({ type: EncounterTableDto })
  @ApiErrors({ 404: 'Encounter table not found' })
  findTable(@Param('id') id: string): Promise<EncounterTable> {
    return this.queryBus.execute<GetEncounterTableQuery, EncounterTable>(new GetEncounterTableQuery(id));
  }

  @Get('encounter-settings')
  @ApiOperation({ operationId: 'findEncounterSettings', summary: 'Modifiers, differentials and specials of the encounter rolls' })
  @ApiOkResponse({ type: EncounterSettingsDto })
  @ApiErrors({ 404: 'The encounter settings are not imported' })
  findSettings(): Promise<EncounterSettings> {
    return this.queryBus.execute<GetEncounterSettingsQuery, EncounterSettings>(new GetEncounterSettingsQuery());
  }

  @Post('encounters/resolve')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'resolveEncounter',
    summary: 'Resolve the encounter rolls made so far: the check, the tables walked and the result or the roll still missing',
  })
  @ApiOkResponse({ type: ResolveEncounterResponseDto })
  @ApiErrors({
    400: 'Bad request, an invalid modifier or a region table missing or not a biome or location table',
    404: 'Encounter table not found, or the encounter settings are not imported',
  })
  resolve(@Body() dto: ResolveEncounterDto): Promise<ResolveEncounterResponse> {
    return this.queryBus.execute<ResolveEncounterQuery, ResolveEncounterResponse>(
      new ResolveEncounterQuery(ResolveEncounterDto.toRequest(dto)),
    );
  }
}
