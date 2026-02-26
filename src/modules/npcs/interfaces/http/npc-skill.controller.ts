/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt.auth.guard';
import type { AuthRequest } from '../../../shared/infrastructure/controller/auth-request';
import { AddSkillCommand } from '../../application/cqrs/commands/add-skill.command';
import { DeleteSkillCommand } from '../../application/cqrs/commands/delete-skill.command';
import { Npc } from '../../domain/aggregates/npc.aggregate';
import { AddSkillDto } from './dtos/add-skill.dto';
import { NpcDto } from './dtos/npc.dto';

@UseGuards(JwtAuthGuard)
@Controller('v1/npcs')
@ApiTags('Npcs Skills')
export class NpcSkillController {
  private readonly logger = new Logger(NpcSkillController.name);

  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post(':id/skills')
  @ApiBody({ type: AddSkillDto })
  @ApiOperation({ operationId: 'addSkill', summary: 'Add a skill to an NPC' })
  @ApiResponse({ type: NpcDto, description: 'Skill added successfully' })
  @HttpCode(HttpStatus.OK)
  async addSkill(@Param('id') npcId: string, @Body() dto: AddSkillDto, @Request() req: AuthRequest): Promise<NpcDto> {
    this.logger.log(`Adding skill to NPC with ID: ${npcId}`);
    const command = AddSkillDto.toCommand(npcId, dto, req.user.id, req.user.roles);
    const entity = await this.commandBus.execute<AddSkillCommand, Npc>(command);
    return NpcDto.fromEntity(entity);
  }

  @Delete(':id/skills/:skillId')
  @ApiOperation({ operationId: 'deleteSkill', summary: 'Delete a skill from an NPC' })
  @ApiResponse({ type: NpcDto, description: 'Skill deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteSkill(
    @Param('id') npcId: string,
    @Param('skillId') skillId: string,
    @Request() req: AuthRequest,
  ): Promise<NpcDto> {
    this.logger.log(`Deleting skill with ID: ${skillId} from NPC with ID: ${npcId}`);
    const command = new DeleteSkillCommand(npcId, skillId, req.user.id, req.user.roles);
    const entity = await this.commandBus.execute<DeleteSkillCommand, Npc>(command);
    return NpcDto.fromEntity(entity);
  }
}
