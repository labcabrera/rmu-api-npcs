import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../shared/infrastructure/controller/dto';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import { NpcAttackDto } from './npc-attack.dto';
import { NpcSkillDto } from './npc-skill.dto';

export class NpcDto {
  @ApiProperty({ description: 'NPC unique identifier', example: 'npc-123' })
  id: string;

  @ApiProperty({ description: 'Realm identifier', example: 'realm-789' })
  realmId: string;

  @ApiProperty({ description: 'NPC name', example: 'Goblin Warrior' })
  name: string;

  @ApiProperty({ description: 'NPC level', example: 5 })
  level: number;

  @ApiProperty({ type: [NpcSkillDto], description: 'NPC skills' })
  skills: NpcSkillDto[];

  @ApiProperty({ type: [NpcAttackDto], description: 'NPC attacks' })
  attacks: NpcAttackDto[];

  @ApiProperty({ description: 'Owner user ID', example: 'user-456' })
  owner: string;

  static fromEntity(entity: Npc): NpcDto {
    return {
      id: entity.id,
      realmId: entity.realmId,
      name: entity.name,
      level: entity.level,
      skills: entity.skills,
      attacks: entity.attacks,
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
