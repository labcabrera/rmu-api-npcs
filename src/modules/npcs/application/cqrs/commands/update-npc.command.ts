import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';
import { NpcSkill } from '../../../domain/value-objects/npc-skill.vo';

export class UpdateNpcCommand {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly level: number | undefined,
    public readonly skills: NpcSkill[] | undefined,
    public readonly attacks: NpcAttack[] | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
