import type { Biome, CriticalImmunity, MovementMode, Pace, ShieldType, Tier } from './npc-types.vo.js';

/** One mode of movement: base movement rate (feet per round at walk pace) and maximum pace. */
export interface NpcMovement {
  mode: MovementMode;
  tier: Tier | null;
  baseRate: number;
  maxPace: Pace;
  note: string | null;
}

/** Critical codes of Table T-3.1e. */
export interface NpcCriticalCodes {
  /** `I`: every critical is one severity lower. */
  reduceSeverity: boolean;
  /** `!`: cannot be staggered, knocked back or down. */
  noKnockdown: boolean;
  /** `@`: immune to stun results. */
  stunImmune: boolean;
  /** `#`: immune to bleeding. */
  bleedImmune: boolean;
  immunities: CriticalImmunity[];
}

/** The `[ranks/bonus]` of the AT/DB column: Running ranks (passive dodge) and the total Running bonus. */
export interface NpcRunning {
  ranks: number;
  bonus: number;
}

/**
 * The `(N20+8/+60)` of the AT/DB column (ADR 0010): the shield type, the DB the shield adds (not in the DB of the
 * block), and the Shield skill of the creature, its ranks and total bonus (null when the block gives only the type).
 */
export interface NpcShield {
  type: ShieldType;
  db: number;
  ranks: number | null;
  bonus: number | null;
}

/** `[Poison, Nerve, -20]`; the book leaves out the type or the modifier of some poisons (`[Poison]`). */
export interface NpcPoison {
  type: string | null;
  rrModifier: number | null;
}

/**
 * An attack of the stat block (`23B(6)bi`): OB, attack size class and attack table (if it has one), plus the additions of
 * section 3.1.
 * Only data: how tactical applies sequences, cooperation or katas is spec 055.
 */
export interface NpcAttack {
  ob: number;
  /** Size class 1-13 of the attack (medium = 5). */
  size: number;
  /** Attack table id; null for an attack with no table of its own (`we`, `rw`, special attacks). */
  attackTable: string | null;
  fumbleTable: string | null;
  /** `[Cold]`: critical type of the additional critical. */
  additionalCritical: string | null;
  /** `>` sets up the next attack next round, `>>` allows it in the same round. */
  sequence: 'single' | 'double' | null;
  /** `Coop10`: creatures needed for a cooperative attack. */
  cooperation: number | null;
  /** `(2WF)`: number of attacks of the kata. */
  kata: number | null;
  /** Index of the attack this one is an `-or-` alternative of. */
  alternativeTo: number | null;
  poison: NpcPoison | null;
  hand: 'left' | null;
  /** The notation as printed, shown to the GM. */
  notation: string | null;
}

/** A skill with its total bonus; creatures have no ranks in the book. */
export interface NpcSkill {
  skillId: string;
  specialization: string | null;
  ranks: number | null;
  bonus: number;
  note: string | null;
}

export interface NpcResistances {
  channeling: number;
  essence: number;
  mentalism: number;
  physical: number;
  fear: number;
}

export interface NpcStats {
  ag: number;
  co: number;
  em: number;
  in: number;
  me: number;
  pr: number;
  qu: number;
  re: number;
  sd: number;
  st: number;
}

export interface NpcEncounter {
  /** Group name of Table T-3.1h (`Solo`, `Pack`…). */
  group: string;
  dice: string | null;
  biomes: Biome[];
  /** Frequency: difficulty modifier to meet one. */
  frequency: number | null;
}

/** Free text of the detailed stat block. */
export interface NpcDetails {
  variants: string | null;
  height: string | null;
  armorDescription: string | null;
  treasure: string | null;
  magicRealm: string | null;
  misc: string | null;
}

/**
 * A creature talent or flaw. Informational (spec 054), except the senses: `traitId` is the catalog talent id that
 * matches the name (spec 076, C7), derived on save; tactical copies those to the actor traits.
 */
export interface NpcTalent {
  name: string;
  tier: string | null;
  params: string | null;
  dp: number | null;
  traitId?: string | null;
}

export interface NpcSource {
  book: string;
  key: string;
  page: number | null;
}
