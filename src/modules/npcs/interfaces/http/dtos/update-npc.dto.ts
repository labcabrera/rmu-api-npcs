import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { UpdateNpcCommand } from '../../../application/cqrs/commands/update-npc.command';
import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';
import { NpcItem } from '../../../domain/value-objects/npc-item.vo';
import { NpcSkill } from '../../../domain/value-objects/npc-skill.vo';

export class UpdateNpcDto {
  @IsString()
  @IsOptional()
  name: string | undefined;

  @IsNumber()
  @IsOptional()
  level: number | undefined;

  @IsNumber()
  @IsOptional()
  bd: number | undefined;

  @IsNumber()
  @IsOptional()
  at: number | undefined;

  @IsNumber()
  @IsOptional()
  initiative: number | undefined;

  @IsArray()
  @IsOptional()
  skills: NpcSkill[] | undefined;

  @IsArray()
  @IsOptional()
  items: NpcItem[] | undefined;

  @IsArray()
  @IsOptional()
  attacks: NpcAttack[] | undefined;

  @IsString()
  @IsOptional()
  description: string | undefined;

  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  static toCommand(id: string, dto: UpdateNpcDto, userId: string, roles: string[]): UpdateNpcCommand {
    return new UpdateNpcCommand(
      id,
      dto.name,
      dto.level,
      dto.bd,
      dto.at,
      dto.initiative,
      dto.skills,
      dto.items,
      dto.attacks,
      dto.description,
      dto.imageUrl,
      userId,
      roles,
    );
  }
}
