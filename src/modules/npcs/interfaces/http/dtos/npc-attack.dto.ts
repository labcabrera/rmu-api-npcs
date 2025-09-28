import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';

export class NpcAttackDto {
  name: string;
  bonus: number;

  static toDomain(attack: NpcAttackDto): NpcAttack {
    return {
      name: attack.name,
      bonus: attack.bonus,
    };
  }
}
