import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../shared/infrastructure/controller/dto';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import { NpcAttackDto } from './npc-attack.dto';
import { NpcSkillDto } from './npc-skill.dto';

export class NpcDto {
  id: string;
  name: string;
  level: number;
  skills: NpcSkillDto[];
  attacks: NpcAttackDto[];
  owner: string;
  createdAt: Date;
  updatedAt: Date | undefined;

  static fromEntity(entity: Npc): NpcDto {
    return {
      id: entity.id,
      name: entity.name,
      level: entity.level,
      skills: entity.skills,
      attacks: entity.attacks,
      owner: entity.owner,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
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
