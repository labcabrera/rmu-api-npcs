import { ApiProperty } from '@nestjs/swagger';
import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';

export class NpcAttackDto {
  @ApiProperty({ description: 'Attack name', example: 'Bite' })
  name: string;

  @ApiProperty({ description: 'Attack table', example: 'attack-table-1' })
  attackTable: string;

  @ApiProperty({ description: 'Attack offensive bonus', example: 5 })
  bo: number;

  @ApiProperty({ description: 'Attack fumble', example: 2 })
  fumble: number;

  static toDomain(attack: NpcAttackDto): NpcAttack {
    return {
      name: attack.name,
      attackTable: attack.attackTable,
      bo: attack.bo,
      fumble: attack.fumble,
    };
  }
}
