import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';
import { NpcSkill } from '../../../domain/value-objects/npc-skill.vo';

export class CreateNpcCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly skills: NpcSkill[],
    public readonly attacks: NpcAttack[],
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
