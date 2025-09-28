import { ApiProperty } from '@nestjs/swagger';
import { NpcItem } from '../../../domain/value-objects/npc-item.vo';

export class NpcItemDto {
  @ApiProperty({ description: 'Skill identifier', example: 'skill-789' })
  name: string;

  @ApiProperty({ description: 'Skill bonus', example: 25 })
  itemTypeId: string;

  @ApiProperty({ description: 'If the item can be stacked', example: true })
  stackeable: boolean;

  @ApiProperty({ description: 'Amount of items', example: 10 })
  amount: number;

  static fromEntity(entity: NpcItem): NpcItemDto {
    const dto = new NpcItemDto();
    dto.name = entity.name;
    dto.itemTypeId = entity.itemTypeId;
    dto.stackeable = entity.stackeable;
    dto.amount = entity.amount;
    return dto;
  }

  static toDomain(dto: NpcItemDto): NpcItem {
    return {
      name: dto.name,
      itemTypeId: dto.itemTypeId,
      stackeable: dto.stackeable,
      amount: dto.amount,
    };
  }
}
