import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { AddSkillCommand } from '../../../application/cqrs/commands/add-skill.command';

export class AddSkillDto {
  constructor(skillId: string, ranks: number, bonus: number) {
    this.skillId = skillId;
    this.ranks = ranks;
    this.bonus = bonus;
  }

  @ApiProperty({ description: 'Skill identifier', example: 'foo' })
  @IsString()
  skillId: string;

  @ApiProperty({ description: 'Skill ranks', example: 5 })
  @IsNumber()
  @IsOptional()
  ranks: number | undefined;

  @ApiProperty({ description: 'Skill bonus', example: 42 })
  @IsNumber()
  bonus: number;

  static toCommand(npcId: string, dto: AddSkillDto, userId: string, roles: string[]): AddSkillCommand {
    return new AddSkillCommand(npcId, dto.skillId, dto.ranks, dto.bonus, userId, roles);
  }
}
