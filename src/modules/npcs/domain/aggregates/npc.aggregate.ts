import { AggregateRoot } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { NpcCreatedEvent } from '../events/npc-created.event';
import { NpcAttack } from '../value-objects/npc-attack.vo';
import { NpcSkill } from '../value-objects/npc-skill.vo';

export interface NpcProps {
  id: string;
  name: string;
  skills: NpcSkill[];
  attacks: NpcAttack[];
  owner: string;
  createdAt: Date;
  updatedAt: Date | undefined;
}

export class Npc extends AggregateRoot<DomainEvent<NpcProps>> {
  private constructor(
    public readonly id: string,
    public name: string,
    public skills: NpcSkill[],
    public attacks: NpcAttack[],
    public owner: string,
    public createdAt: Date,
    public updatedAt: Date | undefined,
  ) {
    super();
  }

  static create(props: Omit<NpcProps, 'id' | 'createdAt' | 'updatedAt'>): Npc {
    const npc = new Npc(
      randomUUID(),
      props.name,
      props.skills ?? [],
      props.attacks ?? [],
      props.owner,
      new Date(),
      undefined,
    );
    npc.apply(new NpcCreatedEvent(npc.toProps()));
    return npc;
  }

  static fromProps(props: NpcProps): Npc {
    return new Npc(
      props.id,
      props.name,
      props.skills ?? [],
      props.attacks ?? [],
      props.owner,
      props.createdAt,
      props.updatedAt,
    );
  }

  toProps(): NpcProps {
    return {
      id: this.id,
      name: this.name,
      skills: this.skills,
      attacks: this.attacks,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
