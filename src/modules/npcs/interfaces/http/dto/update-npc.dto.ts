import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { UpdateNpcCommand } from '../../../application/cqrs/commands/update-npc.command.js';
import { CreateNpcDto, toNpcProps } from './create-npc.dto.js';

/**
 * A partial change: absent fields keep their stored value. The blocks and the lists (attacks, skills, movement…)
 * replace the stored ones whole, validated as in the creation (spec 054: no subresources for skills or attacks).
 */
export class UpdateNpcDto extends PartialType(OmitType(CreateNpcDto, ['realmId'] as const)) {
  @ApiPropertyOptional({ description: 'Version the client read (from the GET); a different stored version is a 409', example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  version?: number;

  static toCommand(npcId: string, dto: UpdateNpcDto, userId: string, roles: string[]): UpdateNpcCommand {
    return new UpdateNpcCommand(npcId, toNpcProps(dto), userId, roles, dto.version);
  }
}
