/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Delete, HttpCode, HttpStatus, Logger, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt.auth.guard';
import { AddAttackCommand } from '../../application/cqrs/commands/add-attack.command';
import { DeleteAttackCommand } from '../../application/cqrs/commands/delete-attack.command';
import { Npc } from '../../domain/aggregates/npc.aggregate';
import { AddAttackDto } from './dtos/add-attack.dto';
import { NpcDto } from './dtos/npc.dto';

@UseGuards(JwtAuthGuard)
@Controller('v1/npcs')
@ApiTags('Npcs Attacks')
export class NpcAttackController {
  private readonly logger = new Logger(NpcAttackController.name);

  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post(':id/attacks')
  @ApiBody({ type: AddAttackDto })
  @ApiOperation({ operationId: 'addAttack', summary: 'Add an attack to an NPC' })
  @ApiResponse({ type: NpcDto, description: 'Attack added successfully' })
  @HttpCode(HttpStatus.OK)
  async addAttack(@Param('id') npcId: string, @Body() dto: AddAttackDto, @Request() req): Promise<NpcDto> {
    this.logger.log(`Adding attack to NPC with ID: ${npcId}`);
    const userId: string = req.user!.id as string;
    const roles: string[] = req.user!.roles as string[];
    const command = AddAttackDto.toCommand(npcId, dto, userId, roles);
    const entity = await this.commandBus.execute<AddAttackCommand, Npc>(command);
    return NpcDto.fromEntity(entity);
  }

  @Delete(':id/attacks/:attackId')
  @ApiOperation({ operationId: 'deleteAttack', summary: 'Delete an attack from an NPC' })
  @ApiResponse({ type: NpcDto, description: 'Attack deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteAttack(@Param('id') npcId: string, @Param('attackId') attackId: string, @Request() req): Promise<NpcDto> {
    this.logger.log(`Deleting attack with ID: ${attackId} from NPC with ID: ${npcId}`);
    const userId: string = req.user!.id as string;
    const roles: string[] = req.user!.roles as string[];
    const command = new DeleteAttackCommand(npcId, attackId, userId, roles);
    const entity = await this.commandBus.execute<DeleteAttackCommand, Npc>(command);
    return NpcDto.fromEntity(entity);
  }
}
