import { NpcSkill } from '../../../domain/value-objects/npc-skill.vo';

export class NpcSkillDto {
  skillId: string;
  bonus: number;

  static toDomain(dto: NpcSkillDto): NpcSkill {
    return {
      skillId: dto.skillId,
      bonus: dto.bonus,
    };
  }
}
