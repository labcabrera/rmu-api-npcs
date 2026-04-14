import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { UpdateNpcCommand } from '../../../application/cqrs/commands/update-npc.command';
import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';
import { NpcItem } from '../../../domain/value-objects/npc-item.vo';
import { NpcOutlookType } from '../../../domain/value-objects/npc-outlook-type.dto';
import { NpcSkill } from '../../../domain/value-objects/npc-skill.vo';

export class UpdateNpcDto {
  @IsString()
  @IsOptional()
  outlookType: NpcOutlookType | undefined;

  @IsString()
  @IsOptional()
  name: string | undefined;

  @IsNumber()
  @IsOptional()
  level: number | undefined;

  @IsNumber()
  @IsOptional()
  hp: number | undefined;

  @IsNumber()
  @IsOptional()
  db: number | undefined;

  @IsNumber()
  @IsOptional()
  at: number | undefined;

  @IsNumber()
  @IsOptional()
  initiative: number | undefined;

  @IsNumber()
  @IsOptional()
  endurance: number | undefined;

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
      {
        outlookType: dto.outlookType,
        name: dto.name,
        level: dto.level,
        hp: dto.hp,
        db: dto.db,
        at: dto.at,
        initiative: dto.initiative,
        endurance: dto.endurance,
        skills: dto.skills,
        items: dto.items,
        attacks: dto.attacks,
        description: dto.description,
        imageUrl: dto.imageUrl,
      },
      userId,
      roles,
    );
  }
}
