import { NpcProps } from '../../../domain/aggregates/npc.aggregate';
import { NpcAttack } from '../../../domain/value-objects/npc-attack.vo';
import { NpcItem } from '../../../domain/value-objects/npc-item.vo';
import { NpcOutlookType } from '../../../domain/value-objects/npc-outlook-type.dto';
import { NpcSkill } from '../../../domain/value-objects/npc-skill.vo';

export class UpdateNpcCommand {
  public readonly id: string;
  public readonly outlookType: NpcOutlookType | undefined;
  public readonly name: string | undefined;
  public readonly level: number | undefined;
  public readonly hp: number | undefined;
  public readonly db: number | undefined;
  public readonly at: number | undefined;
  public readonly initiative: number | undefined;
  public readonly endurance: number | undefined;
  public readonly skills: NpcSkill[] | undefined;
  public readonly items: NpcItem[] | undefined;
  public readonly attacks: NpcAttack[] | undefined;
  public readonly description: string | undefined;
  public readonly imageUrl: string | undefined;
  public readonly userId: string;
  public readonly roles: string[];

  constructor(
    id: string,
    props: Partial<Omit<NpcProps, 'realmId' | 'owner' | 'createdAt' | 'updatedAt'>>,
    userId: string,
    roles: string[],
  ) {
    this.id = id;
    this.outlookType = props.outlookType;
    this.name = props.name;
    this.level = props.level;
    this.hp = props.hp;
    this.db = props.db;
    this.at = props.at;
    this.initiative = props.initiative;
    this.endurance = props.endurance;
    this.skills = props.skills;
    this.items = props.items;
    this.attacks = props.attacks;
    this.description = props.description;
    this.imageUrl = props.imageUrl;
    this.userId = userId;
    this.roles = roles;
  }
}
