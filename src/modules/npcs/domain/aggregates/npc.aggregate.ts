import { Attack } from '../value-objects/attack.vo';
import { Skill } from '../value-objects/skill.vo';

type DomainEvent =
  | { type: 'npc.created'; occurredAt: Date; payload: { id: string; name: string } }
  | { type: 'npc.renamed'; occurredAt: Date; payload: { id: string; name: string } }
  | { type: 'npc.skill.added'; occurredAt: Date; payload: { id: string; skill: { name: string; level: number } } };

export class Npc {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: string,
    private _name: string,
    private _skills: Skill[],
    private _attacks: Attack[],
  ) {}

  static create(props: { id: string; name: string; skills?: Skill[]; attacks?: Attack[] }): Npc {
    if (!props.id?.trim()) throw new Error('Npc.id is required');
    if (!props.name?.trim()) throw new Error('Npc.name is required');
    const npc = new Npc(props.id, props.name.trim(), props.skills ?? [], props.attacks ?? []);
    npc.addEvent({ type: 'npc.created', occurredAt: new Date(), payload: { id: npc.id, name: npc._name } });
    return npc;
  }

  get name() {
    return this._name;
  }
  get skills(): readonly Skill[] {
    return this._skills;
  }
  get attacks(): readonly Attack[] {
    return this._attacks;
  }

  rename(newName: string) {
    const nn = newName?.trim();
    if (!nn) throw new Error('Npc.name is required');
    if (nn !== this._name) {
      this._name = nn;
      this.addEvent({ type: 'npc.renamed', occurredAt: new Date(), payload: { id: this.id, name: this._name } });
    }
  }

  addSkill(skill: Skill) {
    if (this._skills.some((s) => s.equals(skill))) throw new Error('Skill already exists');
    this._skills.push(skill);
    this.addEvent({
      type: 'npc.skill.added',
      occurredAt: new Date(),
      payload: { id: this.id, skill: { name: skill.name, level: skill.level } },
    });
  }

  pullEvents(): DomainEvent[] {
    const e = [...this.domainEvents];
    this.domainEvents = [];
    return e;
  }
  private addEvent(evt: DomainEvent) {
    this.domainEvents.push(evt);
  }
}
