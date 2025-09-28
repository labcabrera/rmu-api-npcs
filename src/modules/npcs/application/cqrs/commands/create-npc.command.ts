import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';
import { NpcItem } from '../../../domain/value-objects/npc-item.vo';
import { NpcSkill } from '../../../domain/value-objects/npc-skill.vo';

export class CreateNpcCommand {
  constructor(
    public readonly realmId: string,
    public readonly name: string,
    public readonly level: number,
    public readonly db: number | undefined,
    public readonly at: number | undefined,
    public readonly skills: NpcSkill[] | undefined,
    public readonly items: NpcItem[] | undefined,
    public readonly attacks: NpcAttack[] | undefined,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
