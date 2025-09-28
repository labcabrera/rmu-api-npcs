import { NotImplementedException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../../shared/infrastructure/controller/dto';
import { Npc } from '../../../domain/aggregates/npc.aggregate';

export class NpcDto {
  static fromEntity(entity: Npc): NpcDto {
    throw new NotImplementedException();
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
