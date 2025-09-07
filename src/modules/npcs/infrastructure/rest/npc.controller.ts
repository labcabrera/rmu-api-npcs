import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import { AddSkillCommand } from '../../application/commands/add-skill.command';
import { CreateNpcCommand } from '../../application/commands/create-npc.command';
import { GetNpcByIdQuery } from '../../application/queries/get-npc-by-id.query';

class CreateNpcDto {
  name!: string;
}
class AddSkillDto {
  skillName!: string;
  level!: number;
}

@Controller('npcs')
export class NpcController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateNpcDto) {
    const id = uuid();
    await this.commands.execute(new CreateNpcCommand(id, dto.name));
    return { id, name: dto.name };
  }

  @Patch(':id/skills')
  addSkill(@Param('id') id: string, @Body() dto: AddSkillDto) {
    return this.commands.execute(new AddSkillCommand(id, dto.skillName, dto.level));
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.queries.execute(new GetNpcByIdQuery(id));
  }
}
