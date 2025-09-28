import { ApiProperty } from '@nestjs/swagger';
import { NpcSkill } from '../../../domain/value-objects/npc-skill.vo';

export class NpcSkillDto {
  @ApiProperty({ description: 'Skill identifier', example: 'skill-789' })
  skillId: string;

  @ApiProperty({ description: 'Skill ranks', example: 3, required: false })
  ranks: number | undefined;

  @ApiProperty({ description: 'Skill bonus', example: 25 })
  bonus: number;

  static toDomain(dto: NpcSkillDto): NpcSkill {
    return {
      skillId: dto.skillId,
      ranks: dto.ranks,
      bonus: dto.bonus,
    };
  }
}
