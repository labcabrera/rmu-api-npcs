import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateNpcCommand } from '../../../application/cqrs/commands/create-npc.command';
import { NpcAttackDto } from './npc-attack.dto';
import { NpcSkillDto } from './npc-skill.dto';

export class CreateNpcDto {
  @ApiProperty({ description: 'Realm identifier', example: 'realm-123' })
  @IsString()
  @IsNotEmpty()
  realmId: string;

  @ApiProperty({ description: 'Name of the NPC', example: 'Wolf lvl 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Level of the NPC', example: 1 })
  @IsNumber()
  level: number;

  @ApiProperty({ description: 'Skills of the NPC', type: [NpcSkillDto] })
  @IsArray()
  skills: NpcSkillDto[];

  @ApiProperty({ description: 'Attacks of the NPC', type: [NpcAttackDto] })
  @IsArray()
  attacks: NpcAttackDto[];

  @ApiProperty({ description: 'Description of the NPC', example: 'A fierce goblin warrior.', required: false })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({ description: 'Image URL of the NPC', example: 'static/images/goblin.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  static toCommand(dto: CreateNpcDto, userId: string, roles: string[]): CreateNpcCommand {
    const skills = dto.skills.map((skill) => NpcSkillDto.toDomain(skill));
    const attacks = dto.attacks.map((attack) => NpcAttackDto.toDomain(attack));
    return new CreateNpcCommand(
      dto.realmId,
      dto.name,
      dto.level,
      skills,
      attacks,
      dto.description,
      dto.imageUrl,
      userId,
      roles,
    );
  }
}
