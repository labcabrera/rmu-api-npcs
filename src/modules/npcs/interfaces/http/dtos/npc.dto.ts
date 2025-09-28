import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../shared/infrastructure/controller/dto';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import type { NpcCategory } from '../../../domain/value-objects/npc-category.vo';
import { NpcAttackDto } from './npc-attack.dto';
import { NpcItemDto } from './npc-item.dto';
import { NpcSkillDto } from './npc-skill.dto';

export class NpcDto {
  @ApiProperty({ description: 'NPC unique identifier', example: 'npc-123' })
  id: string;

  @ApiProperty({ description: 'Realm identifier', example: 'realm-789' })
  realmId: string;

  @ApiProperty({ description: 'NPC category', example: 'humanoid' })
  category: NpcCategory;

  @ApiProperty({ description: 'NPC name', example: 'Goblin Warrior' })
  name: string;

  @ApiProperty({ description: 'NPC level', example: 5 })
  level: number;

  @ApiProperty({ description: 'Defensive bonus', example: 10 })
  bd: number;

  @ApiProperty({ description: 'Armor type', example: 5 })
  at: number;

  @ApiProperty({ description: 'NPC initiative', example: 5 })
  initiative: number;

  @ApiProperty({ type: [NpcSkillDto], description: 'NPC skills' })
  skills: NpcSkillDto[];

  @ApiProperty({ type: [NpcItemDto], description: 'NPC items' })
  items: NpcItemDto[];

  @ApiProperty({ type: [NpcAttackDto], description: 'NPC attacks' })
  attacks: NpcAttackDto[];

  @ApiProperty({ description: 'NPC description', example: 'A fierce goblin warrior.', required: false })
  description?: string;

  @ApiProperty({ description: 'NPC image URL', example: 'static/images/goblin.jpg', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Owner user ID', example: 'user-456' })
  owner: string;

  static fromEntity(entity: Npc): NpcDto {
    return {
      id: entity.id,
      category: entity.category,
      realmId: entity.realmId,
      name: entity.name,
      level: entity.level,
      bd: entity.bd,
      at: entity.at,
      initiative: entity.initiative,
      skills: entity.skills,
      items: entity.items,
      attacks: entity.attacks,
      description: entity.description,
      imageUrl: entity.imageUrl,
      owner: entity.owner,
    };
  }
}

export class NpcPageDto {
  @ApiProperty({
    type: [NpcDto],
    description: 'Npcs',
    isArray: true,
  })
  content: NpcDto[];
  @ApiProperty({
    type: PaginationDto,
    description: 'Pagination information',
  })
  pagination: PaginationDto;
}
