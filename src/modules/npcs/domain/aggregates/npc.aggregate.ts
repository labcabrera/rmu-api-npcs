import { randomUUID } from 'crypto';
import { BaseAggregateRoot } from '../../../shared/domain/aggregates/base-aggregate';
import { ValidationError } from '../../../shared/domain/errors/errors';
import { NpcCreatedEvent } from '../events/npc-created.event';
import { NpcUpdatedEvent } from '../events/npc-updated.event';
import { NpcAttack } from '../value-objects/npc-attack.vo';
import { NpcCategory } from '../value-objects/npc-category.vo';
import { NpcItem } from '../value-objects/npc-item.vo';
import { NpcOutlookType } from '../value-objects/npc-outlook-type.dto';
import { NpcSkill } from '../value-objects/npc-skill.vo';
import { NpcProps } from './npc-props';

export class Npc extends BaseAggregateRoot<NpcProps> {
  private constructor(
    id: string,
    public readonly realmId: string,
    public category: NpcCategory,
    public outlookType: NpcOutlookType,
    public name: string,
    public level: number,
    public hp: number,
    public db: number,
    public at: number,
    public initiative: number,
    public endurance: number,
    public skills: NpcSkill[],
    public items: NpcItem[],
    public attacks: NpcAttack[],
    public description: string | undefined,
    public imageUrl: string | undefined,
    public owner: string,
    public createdAt: Date,
    public updatedAt: Date | undefined,
  ) {
    super(id);
  }

  static create(props: Omit<NpcProps, 'id' | 'createdAt' | 'updatedAt'>): Npc {
    const npc = new Npc(
      randomUUID(),
      props.realmId,
      props.category,
      props.outlookType,
      props.name,
      props.level,
      props.hp,
      props.db,
      props.at,
      props.initiative,
      props.endurance,
      props.skills ?? [],
      props.items ?? [],
      props.attacks ?? [],
      props.description,
      props.imageUrl,
      props.owner,
      new Date(),
      undefined,
    );
    npc.apply(new NpcCreatedEvent(npc.getProps()));
    return npc;
  }

  update(props: Partial<Omit<NpcProps, 'id' | 'realmId' | 'owner' | 'createdAt' | 'updatedAt'>>): void {
    const { outlookType, name, level, hp, db, at, initiative, endurance, skills, attacks, description, imageUrl } = props;
    if (outlookType) this.outlookType = outlookType;
    if (name) this.name = name;
    if (level) this.level = level;
    if (hp) this.db = hp;
    if (db) this.db = db;
    if (at) this.at = at;
    if (initiative) this.initiative = initiative;
    if (endurance) this.endurance = endurance;
    if (skills) this.skills = skills;
    if (attacks) this.attacks = attacks;
    if (description !== undefined) this.description = description;
    if (imageUrl !== undefined) this.imageUrl = imageUrl;
    this.updatedAt = new Date();
    this.apply(new NpcUpdatedEvent(this.getProps()));
  }

  addSkill(skill: NpcSkill): void {
    if (this.skills.some(s => s.skillId === skill.skillId)) {
      throw new ValidationError(`Skill with id ${skill.skillId} already exists`);
    }
    this.skills.push(skill);
    this.updatedAt = new Date();
    this.apply(new NpcUpdatedEvent(this.getProps()));
  }

  deleteSkill(skillId: string) {
    const index = this.skills.findIndex(s => s.skillId === skillId);
    if (index === -1) {
      throw new ValidationError(`Skill with id ${skillId} does not exist`);
    }
    this.skills.splice(index, 1);
    this.updatedAt = new Date();
    this.apply(new NpcUpdatedEvent(this.getProps()));
  }

  addAttack(attack: NpcAttack): void {
    if (this.attacks.some(a => a.attackName === attack.attackName)) {
      throw new ValidationError(`Attack with name ${attack.attackName} already exists`);
    }
    this.attacks.push(attack);
    this.updatedAt = new Date();
    this.apply(new NpcUpdatedEvent(this.getProps()));
  }

  deleteAttack(attackName: string): void {
    const index = this.attacks.findIndex(a => a.attackName === attackName);
    if (index === -1) {
      throw new ValidationError(`Attack with name ${attackName} does not exist`);
    }
    this.attacks.splice(index, 1);
    this.updatedAt = new Date();
    this.apply(new NpcUpdatedEvent(this.getProps()));
  }

  static fromProps(props: NpcProps): Npc {
    return new Npc(
      props.id,
      props.realmId,
      props.category,
      props.outlookType,
      props.name,
      props.level,
      props.hp,
      props.db,
      props.at,
      props.initiative,
      props.endurance,
      props.skills ?? [],
      props.items ?? [],
      props.attacks ?? [],
      props.description,
      props.imageUrl,
      props.owner,
      props.createdAt,
      props.updatedAt,
    );
  }

  getProps(): NpcProps {
    return {
      id: this.id,
      realmId: this.realmId,
      category: this.category,
      outlookType: this.outlookType,
      name: this.name,
      level: this.level,
      hp: this.hp,
      db: this.db,
      at: this.at,
      initiative: this.initiative,
      endurance: this.endurance,
      skills: this.skills,
      items: this.items,
      attacks: this.attacks,
      description: this.description,
      imageUrl: this.imageUrl,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
