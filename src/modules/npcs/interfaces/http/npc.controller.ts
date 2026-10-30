import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/security/jwt-auth.guard.js';
import { ApiErrors } from '../../../shared/interfaces/http/api-errors.decorator.js';
import type { AuthenticatedUser } from '../../../shared/interfaces/http/authenticated-request.js';
import { CurrentUser } from '../../../shared/interfaces/http/current-user.decorator.js';
import { CatalogPagedQueryDto } from '../../../shared/interfaces/http/dto/paged-rsql-query.js';
import { Page } from '../../../shared/application/pagination/page.js';
import { CreateNpcCommand } from '../../application/cqrs/commands/create-npc.command.js';
import { DeleteNpcCommand } from '../../application/cqrs/commands/delete-npc.command.js';
import { UpdateNpcCommand } from '../../application/cqrs/commands/update-npc.command.js';
import { GetNpcQuery } from '../../application/cqrs/queries/get-npc.query.js';
import { GetNpcsQuery } from '../../application/cqrs/queries/get-npcs.query.js';
import { Npc } from '../../domain/aggregates/npc.aggregate.js';
import { CreateNpcDto } from './dto/create-npc.dto.js';
import { NpcDto, NpcPageDto } from './dto/npc.dto.js';
import { UpdateNpcDto } from './dto/update-npc.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('v1/npcs')
@ApiTags('NPCs')
export class NpcController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({ operationId: 'findNpcById', summary: 'Find NPC by id' })
  @ApiOkResponse({ type: NpcDto })
  @ApiErrors({ 404: 'NPC not found', 403: 'A private NPC of another user' })
  async findById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const npc = await this.queryBus.execute<GetNpcQuery, Npc>(new GetNpcQuery(id, user.id, user.roles));
    return NpcDto.fromEntity(npc);
  }

  @Get('')
  @ApiOperation({ operationId: 'findNpcs', summary: 'Find NPCs by RSQL: the public catalog and your own' })
  @ApiOkResponse({ type: NpcPageDto })
  @ApiErrors({ 400: 'Invalid RSQL query' })
  // Up to 1000: the catalog of generic creatures is loaded whole.
  async find(@Query() dto: CatalogPagedQueryDto, @CurrentUser() user: AuthenticatedUser) {
    const page = await this.queryBus.execute<GetNpcsQuery, Page<Npc>>(new GetNpcsQuery(dto.q, dto.page, dto.size, user.id, user.roles));
    const mapped = page.content.map(npc => NpcDto.fromEntity(npc));
    return new Page<NpcDto>(mapped, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }

  @Post('')
  @ApiOperation({ operationId: 'createNpc', summary: 'Create an NPC' })
  @ApiCreatedResponse({ type: NpcDto, description: 'Created' })
  @ApiErrors({
    400: 'Bad request, invalid data or unknown realm',
    403: 'Without rmu-user or rmu-admin, or a public NPC without rmu-admin',
    502: 'Core did not answer the realm check',
    504: 'Core did not answer the realm check in time',
  })
  async create(@Body() dto: CreateNpcDto, @CurrentUser() user: AuthenticatedUser) {
    const npc = await this.commandBus.execute<CreateNpcCommand, Npc>(CreateNpcDto.toCommand(dto, user.id, user.roles));
    return NpcDto.fromEntity(npc);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateNpc', summary: 'Update an NPC: the lists sent replace the stored ones' })
  @ApiOkResponse({ type: NpcDto, description: 'Success' })
  @ApiErrors({
    404: 'NPC not found',
    400: 'Bad request, invalid data',
    403: 'Not the owner or an admin, or a public NPC without rmu-admin',
    409: 'The NPC changed since the version sent',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateNpcDto, @CurrentUser() user: AuthenticatedUser) {
    const npc = await this.commandBus.execute<UpdateNpcCommand, Npc>(UpdateNpcDto.toCommand(id, dto, user.id, user.roles));
    return NpcDto.fromEntity(npc);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteNpc', summary: 'Delete an NPC' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiErrors({ 404: 'NPC not found', 403: 'Not the owner or an admin, or a public NPC without rmu-admin' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.commandBus.execute(new DeleteNpcCommand(id, user.id, user.roles));
  }
}
