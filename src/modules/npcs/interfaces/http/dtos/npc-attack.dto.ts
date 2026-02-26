import { ApiProperty } from '@nestjs/swagger';
import type { AttackType } from '../../../domain/value-objects/attack-type.vo';
import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';

export class NpcAttackDto {
  @ApiProperty({ description: 'Attack name', example: 'Bite' })
  attackName: string;

  @ApiProperty({ description: 'Attack type', example: 'melee' })
  attackType: AttackType;

  @ApiProperty({ description: 'Attack table', example: 'attack-table-1' })
  attackTable: string;

  @ApiProperty({ description: 'Fumble table', example: 'fumble-table-1' })
  fumbleTable: string;

  @ApiProperty({ description: 'Attack size', example: 1 })
  attackSize: number;

  @ApiProperty({ description: 'Attack offensive bonus', example: 5 })
  bo: number;

  @ApiProperty({ description: 'Attack fumble', example: 2 })
  fumble: number;

  static toDomain(attack: NpcAttackDto): NpcAttack {
    return {
      attackName: attack.attackName,
      attackType: attack.attackType,
      attackTable: attack.attackTable,
      fumbleTable: attack.fumbleTable,
      attackSize: attack.attackSize,
      bo: attack.bo,
      fumble: attack.fumble,
    };
  }
}
