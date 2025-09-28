import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import type { NpcRepository } from '../../ports/npc.repository';
import { AddSkillCommand } from '../commands/add-skill.command';

@CommandHandler(AddSkillCommand)
export class AddSkillHandler implements ICommandHandler<AddSkillCommand> {
  constructor(
    @Inject('NpcRepository') private readonly repo: NpcRepository,
    private readonly eventBus: EventBus,
  ) {}
  async execute({ id, skillName, level }: AddSkillCommand) {
    const npc = await this.repo.findById(id);
    if (!npc) throw new NotFoundException('NPC not found');
    // npc.addSkill(Skill.create({ name: skillName, level }));
    const updated = await this.repo.save(npc);
    return updated;
  }
}
