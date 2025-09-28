import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { UpdateNpcCommand } from '../../../application/cqrs/commands/update-npc.command';
import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';
import { NpcSkill } from '../../../domain/value-objects/npc-skill.vo';

export class UpdateNpcDto {
  @IsString()
  @IsOptional()
  name: string | undefined;

  @IsNumber()
  @IsOptional()
  level: number | undefined;

  @IsArray()
  @IsOptional()
  skills: NpcSkill[] | undefined;

  @IsArray()
  @IsOptional()
  attacks: NpcAttack[] | undefined;

  static toCommand(id: string, dto: UpdateNpcDto, userId: string, roles: string[]): UpdateNpcCommand {
    return new UpdateNpcCommand(id, dto.name, dto.level, dto.skills, dto.attacks, userId, roles);
  }
}
