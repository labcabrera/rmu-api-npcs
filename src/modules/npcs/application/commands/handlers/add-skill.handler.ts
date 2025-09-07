// application/commands/handlers/add-skill.handler.ts
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import * as npcRepository from '../../../domain/ports/npc.repository';
import { Skill } from '../../../domain/value-objects/skill.vo';
import { AddSkillCommand } from '../add-skill.command';

@CommandHandler(AddSkillCommand)
export class AddSkillHandler implements ICommandHandler<AddSkillCommand> {
  constructor(
    @Inject('NpcRepository') private readonly repo: npcRepository.NpcRepository,
    private readonly eventBus: EventBus,
  ) {}
  async execute({ id, skillName, level }: AddSkillCommand) {
    const npc = await this.repo.findById(id);
    if (!npc) throw new NotFoundException('NPC not found');
    npc.addSkill(Skill.create({ name: skillName, level }));
    await this.repo.save(npc);
    for (const evt of npc.pullEvents()) this.eventBus.publish(evt as any);
  }
}
