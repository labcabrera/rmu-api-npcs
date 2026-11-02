import type { AccessType } from '../../../shared/domain/entities/access-type.js';
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
import type { CreatureSize, LevelSpread, NpcArchetype, NpcCategory, NpcOutlookType } from '../value-objects/npc-types.vo.js';

export interface NpcItem {
  name: string;
  itemTypeId: string | null;
  amount: number;
}

/** An NPC or creature: the Combat Stat Block of Creature Law (spec 054) plus ownership and presentation. */
export interface NpcProps {
  id: string;
  realmId: string;
  /** Public NPCs are the catalog (admin only); the rest are private to their owner (spec 054). */
  accessType: AccessType;
  name: string;
  category: NpcCategory;
  /** The book section (`carnivore`, `reptile`…), free text. */
  type: string | null;
  /** The group of the section (`bear`, `wolf`…), free text. */
  group: string | null;
  level: number;
  levelSpread: LevelSpread | null;
  outlookType: NpcOutlookType | null;
  /** Fright level of the creature (0-30): the base of a fear check it causes (spec 068, decision 17). */
  frightLevel: number | null;
  archetype: NpcArchetype | null;
  movement: NpcMovement[];
  /** Endurance: rounds of exertion before fatigue checks. */
  endurance: number | null;
  size: CreatureSize;
  /** Size used for criticals, when it differs from the size. */
  criticalSize: CreatureSize | null;
  criticalCodes: NpcCriticalCodes;
  hp: number;
  /** Hit total at which the creature dies (the value in parentheses of the Hits column). */
  deathHits: number | null;
  at: number;
  db: number;
  running: NpcRunning | null;
  shield: NpcShield | null;
  initiative: number;
  attacks: NpcAttack[];
  powerPoints: number | null;
  resistances: NpcResistances | null;
  skills: NpcSkill[];
  encounter: NpcEncounter | null;
  stats: NpcStats | null;
  details: NpcDetails | null;
  talents: NpcTalent[];
  items: NpcItem[];
  source: NpcSource | null;
  description: string | null;
  imageUrl: string | null;
  owner: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export type NpcCreationProps = Omit<NpcProps, 'id' | 'createdAt' | 'updatedAt'>;

export type NpcUpdateProps = Partial<Omit<NpcProps, 'id' | 'realmId' | 'owner' | 'source' | 'createdAt' | 'updatedAt'>>;
