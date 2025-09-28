import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateNpcCommand } from '../../../application/cqrs/commands/create-npc.command';
import type { NpcCategory } from '../../../domain/value-objects/npc-category.vo';
import { NpcAttackDto } from './npc-attack.dto';
import { NpcItemDto } from './npc-item.dto';
import { NpcSkillDto } from './npc-skill.dto';

export class CreateNpcDto {
  @ApiProperty({ description: 'Realm identifier', example: 'realm-123' })
  @IsString()
  @IsNotEmpty()
  realmId: string;

  @ApiProperty({ description: 'Category of the NPC', example: 'humanoid' })
  @IsString()
  @IsNotEmpty()
  category: NpcCategory;

  @ApiProperty({ description: 'Name of the NPC', example: 'Wolf lvl 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Level of the NPC', example: 1 })
  @IsNumber()
  level: number;

  @ApiProperty({ description: 'Defensive bonus', example: 10, default: 0 })
  @IsNumber()
  @IsOptional()
  db: number | undefined;

  @ApiProperty({ description: 'Armor type', example: 5, minimum: 1, maximum: 10, default: 1 })
  @IsNumber()
  @IsOptional()
  at: number | undefined;

  @ApiProperty({ description: 'Skills of the NPC', type: [NpcSkillDto] })
  @IsArray()
  @IsOptional()
  skills: NpcSkillDto[];

  @ApiProperty({ description: 'Items of the NPC', type: [NpcItemDto] })
  @IsArray()
  @IsOptional()
  items: NpcItemDto[];

  @ApiProperty({ description: 'Attacks of the NPC', type: [NpcAttackDto] })
  @IsArray()
  @IsOptional()
  attacks: NpcAttackDto[];

  @ApiProperty({ description: 'Description of the NPC', example: 'A fierce goblin warrior.', required: false })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({ description: 'Image URL of the NPC', example: 'static/images/goblin.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  static toCommand(dto: CreateNpcDto, userId: string, roles: string[]): CreateNpcCommand {
    return new CreateNpcCommand(
      dto.realmId,
      dto.category,
      dto.name,
      dto.level,
      dto.db,
      dto.at,
      dto.skills ? dto.skills.map((skill) => NpcSkillDto.toDomain(skill)) : [],
      dto.items ? dto.items.map((item) => NpcItemDto.toDomain(item)) : [],
      dto.attacks ? dto.attacks.map((attack) => NpcAttackDto.toDomain(attack)) : [],
      dto.description,
      dto.imageUrl,
      userId,
      roles,
    );
  }
}
