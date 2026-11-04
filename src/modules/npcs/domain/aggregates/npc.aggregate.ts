import { randomUUID } from 'crypto';
import { BaseAggregateRoot } from '../../../shared/domain/aggregates/base-aggregate.js';
import type { AccessType } from '../../../shared/domain/entities/access-type.js';
import { ValidationError } from '../../../shared/domain/errors/errors.js';
import { NpcCreatedEvent, NpcUpdatedEvent } from '../events/npc.events.js';
import type {
  NpcAttack,
  NpcCriticalCodes,
  NpcDetails,
  NpcEncounter,
  NpcMovement,
  NpcResistances,
  NpcRunning,
  NpcShield,
  NpcSkill,
  NpcSource,
  NpcStats,
  NpcTalent,
} from '../value-objects/npc-stat-block.vo.js';
import { CREATURE_SIZES } from '../value-objects/npc-types.vo.js';
import type { CreatureSize, LevelSpread, NpcArchetype, NpcCategory, NpcOutlookType } from '../value-objects/npc-types.vo.js';
import type { NpcCreationProps, NpcItem, NpcProps, NpcUpdateProps } from './npc-props.js';

/** Range of the fright level of a creature (spec 068, decision 17). */
export const MIN_FRIGHT_LEVEL = 0;
export const MAX_FRIGHT_LEVEL = 30;

export class Npc extends BaseAggregateRoot<NpcProps> {
  public realmId: string | null;
  public accessType: AccessType;
  public name: string;
  public category: NpcCategory;
  public type: string | null;
  public group: string | null;
  public level: number;
  public levelSpread: LevelSpread | null;
  public outlookType: NpcOutlookType | null;
  public frightLevel: number | null;
  public archetype: NpcArchetype | null;
  public movement: NpcMovement[];
  public endurance: number | null;
  public size: CreatureSize;
  public criticalSize: CreatureSize | null;
  public criticalCodes: NpcCriticalCodes;
  public hp: number;
  public deathHits: number | null;
  public at: number;
  public db: number;
  public running: NpcRunning | null;
  public shield: NpcShield | null;
  public initiative: number;
  public attacks: NpcAttack[];
  public powerPoints: number | null;
  public resistances: NpcResistances | null;
  public skills: NpcSkill[];
  public encounter: NpcEncounter | null;
  public stats: NpcStats | null;
  public details: NpcDetails | null;
  public talents: NpcTalent[];
  public items: NpcItem[];
  public source: NpcSource | null;
  public description: string | null;
  public imageUrl: string | null;
  public owner: string;
  public createdAt: Date;
  public updatedAt: Date | null;

  private constructor(props: NpcProps) {
    super(props.id);
    this.realmId = props.realmId ?? null;
    this.accessType = props.accessType;
    this.name = props.name;
    this.category = props.category;
    this.type = props.type;
    this.group = props.group;
    this.level = props.level;
    this.levelSpread = props.levelSpread;
    this.outlookType = props.outlookType;
    this.frightLevel = props.frightLevel;
    this.archetype = props.archetype;
    this.movement = props.movement;
    this.endurance = props.endurance;
    this.size = props.size;
    this.criticalSize = props.criticalSize;
    this.criticalCodes = props.criticalCodes;
    this.hp = props.hp;
    this.deathHits = props.deathHits;
    this.at = props.at;
    this.db = props.db;
    this.running = props.running;
    this.shield = props.shield;
    this.initiative = props.initiative;
    this.attacks = props.attacks;
    this.powerPoints = props.powerPoints;
    this.resistances = props.resistances;
    this.skills = props.skills;
    this.encounter = props.encounter;
    this.stats = props.stats;
    this.details = props.details;
    this.talents = props.talents;
    this.items = props.items;
    this.source = props.source;
    this.description = props.description;
    this.imageUrl = props.imageUrl;
    this.owner = props.owner;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: NpcCreationProps): Npc {
    const npc = new Npc({ ...props, id: randomUUID(), createdAt: new Date(), updatedAt: null });
    npc.validate();
    npc.apply(new NpcCreatedEvent(npc.getProps()));
    return npc;
  }

  /** Stored documents of the old model (before spec 054) may miss the new fields: they get the empty defaults. */
  public static fromProps(props: NpcProps): Npc {
    return new Npc({
      ...props,
      accessType: props.accessType ?? 'private',
      type: props.type ?? null,
      group: props.group ?? null,
      levelSpread: props.levelSpread ?? null,
      outlookType: props.outlookType ?? null,
      frightLevel: props.frightLevel ?? null,
      archetype: props.archetype ?? null,
      movement: props.movement ?? [],
      endurance: props.endurance ?? null,
      size: props.size ?? 'medium',
      criticalSize: props.criticalSize ?? null,
      criticalCodes: props.criticalCodes ?? Npc.emptyCriticalCodes(),
      deathHits: props.deathHits ?? null,
      running: props.running ?? null,
      shield: props.shield ?? null,
      attacks: props.attacks ?? [],
      powerPoints: props.powerPoints ?? null,
      resistances: props.resistances ?? null,
      skills: props.skills ?? [],
      encounter: props.encounter ?? null,
      stats: props.stats ?? null,
      details: props.details ?? null,
      talents: props.talents ?? [],
      items: props.items ?? [],
      source: props.source ?? null,
      description: props.description ?? null,
      imageUrl: props.imageUrl ?? null,
      updatedAt: props.updatedAt ?? null,
    });
  }

  public static emptyCriticalCodes(): NpcCriticalCodes {
    return { reduceSeverity: false, noKnockdown: false, stunImmune: false, bleedImmune: false, immunities: [] };
  }

  /** The PATCH replaces whole fields: an array sent (attacks, skills…) replaces the stored one. */
  update(props: NpcUpdateProps): void {
    const changes = Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as NpcUpdateProps;
    Object.assign(this, changes);
    this.validate();
    this.updatedAt = new Date();
    this.apply(new NpcUpdatedEvent(this.getProps()));
  }

  validate(): void {
    if (!this.name?.trim()) throw new ValidationError('Name is required');
    if (!Number.isInteger(this.level) || this.level < 0) throw new ValidationError('Level must be a positive integer');
    if (
      this.frightLevel !== null &&
      (!Number.isInteger(this.frightLevel) || this.frightLevel < MIN_FRIGHT_LEVEL || this.frightLevel > MAX_FRIGHT_LEVEL)
    ) {
      throw new ValidationError(`Fright level must be an integer between ${MIN_FRIGHT_LEVEL} and ${MAX_FRIGHT_LEVEL}`);
    }
    if (!(this.hp > 0)) throw new ValidationError('Hits must be greater than 0');
    if (this.deathHits !== null && this.deathHits < this.hp) throw new ValidationError('Death hits cannot be less than hits');
    if (!CREATURE_SIZES.includes(this.size)) throw new ValidationError(`Invalid size ${this.size}`);
    this.attacks.forEach((attack, index) => {
      if (!Number.isInteger(attack.size) || attack.size < 1 || attack.size > CREATURE_SIZES.length) {
        throw new ValidationError(`Invalid size of attack ${index + 1}`);
      }
      if (attack.alternativeTo !== null && attack.alternativeTo !== undefined) {
        if (attack.alternativeTo < 0 || attack.alternativeTo >= index) {
          throw new ValidationError(`Attack ${index + 1} must be an alternative of a previous attack`);
        }
      }
    });
    const skillKeys = this.skills.map(s => `${s.skillId}:${s.specialization ?? ''}`);
    const duplicated = skillKeys.find((key, index) => skillKeys.indexOf(key) !== index);
    if (duplicated) throw new ValidationError(`Duplicated skill ${duplicated.replace(/:$/, '')}`);
  }

  getProps(): NpcProps {
    return {
      id: this.id,
      realmId: this.realmId,
      accessType: this.accessType,
      name: this.name,
      category: this.category,
      type: this.type,
      group: this.group,
      level: this.level,
      levelSpread: this.levelSpread,
      outlookType: this.outlookType,
      frightLevel: this.frightLevel,
      archetype: this.archetype,
      movement: this.movement,
      endurance: this.endurance,
      size: this.size,
      criticalSize: this.criticalSize,
      criticalCodes: this.criticalCodes,
      hp: this.hp,
      deathHits: this.deathHits,
      at: this.at,
      db: this.db,
      running: this.running,
      shield: this.shield,
      initiative: this.initiative,
      attacks: this.attacks,
      powerPoints: this.powerPoints,
      resistances: this.resistances,
      skills: this.skills,
      encounter: this.encounter,
      stats: this.stats,
      details: this.details,
      talents: this.talents,
      items: this.items,
      source: this.source,
      description: this.description,
      imageUrl: this.imageUrl,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
