import { AggregateRoot } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { NpcCreatedEvent } from '../events/npc-created.event';
import { NpcUpdatedEvent } from '../events/npc-updated.event';
import { NpcAttack } from '../value-objects/npc-attack.vo';
import { NpcCategory } from '../value-objects/npc-category.vo';
import { NpcItem } from '../value-objects/npc-item.vo';
import { NpcOutlookType } from '../value-objects/npc-outlook-type.dto';
import { NpcSkill } from '../value-objects/npc-skill.vo';

export interface NpcProps {
  id: string;
  realmId: string;
  category: NpcCategory;
  outlookType: NpcOutlookType;
  name: string;
  level: number;
  hp: number;
  db: number;
  at: number;
  initiative: number;
  endurance: number;
  skills: NpcSkill[];
  items: NpcItem[];
  attacks: NpcAttack[];
  description: string | undefined;
  imageUrl: string | undefined;
  owner: string;
  createdAt: Date;
  updatedAt: Date | undefined;
}

export class Npc extends AggregateRoot<DomainEvent<NpcProps>> {
  private constructor(
    public readonly id: string,
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
    super();
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
    npc.apply(new NpcCreatedEvent(npc.toProps()));
    return npc;
  }

  update(props: Partial<Omit<NpcProps, 'id' | 'realmId' | 'owner' | 'createdAt' | 'updatedAt'>>): void {
    const { outlookType, name, level, hp, db, at, initiative, skills, attacks, description, imageUrl } = props;
    if (outlookType) this.outlookType = outlookType;
    if (name) this.name = name;
    if (level) this.level = level;
    if (hp) this.db = hp;
    if (db) this.db = db;
    if (at) this.at = at;
    if (initiative) this.initiative = initiative;
    if (skills) this.skills = skills;
    if (attacks) this.attacks = attacks;
    if (description !== undefined) this.description = description;
    if (imageUrl !== undefined) this.imageUrl = imageUrl;
    this.updatedAt = new Date();
    this.apply(new NpcUpdatedEvent(this.toProps()));
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

  toProps(): NpcProps {
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
