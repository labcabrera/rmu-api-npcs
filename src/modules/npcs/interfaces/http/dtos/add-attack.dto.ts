import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { AddAttackCommand } from '../../../application/cqrs/commands/add-attack.command';
import type { AttackType } from '../../../domain/value-objects/attack-type.vo';

export class AddAttackDto {
  @ApiProperty({ description: 'Attack name', example: 'Bite' })
  @IsString()
  attackName: string;

  @ApiProperty({ description: 'Attack type', example: 'melee' })
  @IsString()
  attackType: AttackType;

  @ApiProperty({ description: 'Attack table', example: 'attack-table-1' })
  @IsString()
  attackTable: string;

  @ApiProperty({ description: 'Fumble table', example: 'fumble-table-1' })
  @IsString()
  fumbleTable: string;

  @ApiProperty({ description: 'Attack size', example: 1 })
  @Type(() => Number)
  @IsNumber()
  attackSize: number;

  @ApiProperty({ description: 'Attack offensive bonus', example: 5 })
  @Type(() => Number)
  @IsNumber()
  bo: number;

  @ApiProperty({ description: 'Attack fumble', example: 2 })
  @Type(() => Number)
  @IsNumber()
  fumble: number;

  static toCommand(npcId: string, dto: AddAttackDto, userId: string, roles: string[]): AddAttackCommand {
    return new AddAttackCommand(
      npcId,
      dto.attackName,
      dto.attackType,
      dto.attackTable,
      dto.fumbleTable,
      dto.attackSize,
      dto.bo,
      dto.fumble,
      userId,
      roles,
    );
  }
}
