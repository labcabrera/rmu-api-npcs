/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt.auth.guard';
import { Page } from '../../../shared/domain/entities/page.entity';
import { ErrorDto, PagedQueryDto } from '../../../shared/infrastructure/controller/dto';
import { CreateNpcCommand } from '../../application/cqrs/commands/create-npc.command';
import { DeleteNpcCommand } from '../../application/cqrs/commands/delete-npc.command';
import { GetNpcQuery } from '../../application/cqrs/queries/get-npc.query';
import { GetNpcsQuery } from '../../application/cqrs/queries/get-npcs.query';
import { Npc } from '../../domain/aggregates/npc.aggregate';
import { CreateNpcDto } from './dtos/create-npc.dto';
import { NpcDto, NpcPageDto } from './dtos/npc.dto';

@UseGuards(JwtAuthGuard)
@Controller('v1/npcs')
@ApiTags('Npcs')
export class NpcController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({ operationId: 'findNpcById', summary: 'Find NPC by id' })
  @ApiOkResponse({ type: NpcDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'NPC not found', type: ErrorDto })
  async findById(@Param('id') id: string, @Request() req) {
    const query = new GetNpcQuery(id, req.user!.id as string, req.user!.roles as string[]);
    const entity = await this.queryBus.execute<GetNpcQuery, Npc>(query);
    return NpcDto.fromEntity(entity);
  }

  @Get('')
  @ApiOperation({ operationId: 'findNpcs', summary: 'Find Npcs by RSQL' })
  @ApiOkResponse({ type: NpcPageDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Invalid RSQL query', type: ErrorDto })
  async find(@Query() dto: PagedQueryDto, @Request() req) {
    const userId: string = req.user!.id as string;
    const roles: string[] = req.user!.roles as string[];
    const query = new GetNpcsQuery(dto.q, dto.page, dto.size, userId, roles);
    const page = await this.queryBus.execute<GetNpcsQuery, Page<Npc>>(query);
    const mapped = page.content.map((Npc) => NpcDto.fromEntity(Npc));
    return new Page<NpcDto>(mapped, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }

  @Post('')
  @ApiBody({ type: CreateNpcDto })
  @ApiOperation({ operationId: 'createNpc', summary: 'Create a new Npc' })
  @ApiOkResponse({ type: NpcDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  @ApiResponse({ status: 409, description: 'Conflict, Npc already exists', type: ErrorDto })
  async create(@Body() dto: CreateNpcDto, @Request() req) {
    const user = req.user!;
    const command = CreateNpcDto.toCommand(dto, user.id as string, user.roles as string[]);
    const entity = await this.commandBus.execute<CreateNpcCommand, Npc>(command);
    return NpcDto.fromEntity(entity);
  }

  // @Patch(':id')
  // @ApiOperation({ operationId: 'updateNpc', summary: 'Update Npc' })
  // @ApiOkResponse({ type: NpcDto, description: 'Success' })
  // @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  // @ApiNotFoundResponse({ description: 'Npc not found', type: ErrorDto })
  // @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  // async updateSettings(@Param('id') id: string, @Body() dto: UpdateNpcDto, @Request() req) {
  //   const user = req.user!;
  //   const command = UpdateNpcDto.toCommand(id, dto, user.id as string, user.roles as string[]);
  //   const entity = await this.commandBus.execute<UpdateNpcCommand, Npc>(command);
  //   return NpcDto.fromEntity(entity);
  // }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteNpc', summary: 'Delete NPC by id' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Npc not found', type: ErrorDto })
  async delete(@Param('id') id: string, @Request() req) {
    const user = req.user! as string;
    const roles: string[] = req.user!.roles as string[];
    const command = new DeleteNpcCommand(id, user, roles);
    await this.commandBus.execute(command);
  }
}
