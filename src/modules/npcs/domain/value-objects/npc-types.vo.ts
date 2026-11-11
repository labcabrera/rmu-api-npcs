/** Creature categories of Creature Law (section 2.1); `other` keeps NPCs that fit none of them. */
export const NPC_CATEGORIES = [
  'animal',
  'artificial',
  'elemental',
  'extra-planar',
  'fell',
  'fey',
  'monster',
  'plant',
  'race',
  'undead',
  'other',
] as const;
export type NpcCategory = (typeof NPC_CATEGORIES)[number];

/** Outlook types of Creature Law (section 3.1). */
export const OUTLOOK_TYPES = [
  'aggressive',
  'aloof',
  'altruistic',
  'belligerent',
  'berserk',
  'carefree',
  'considerate',
  'cruel',
  'crusading',
  'dominant',
  'friendly',
  'greedy',
  'helpful',
  'hidden-agenda',
  'hostile',
  'hungry',
  'hunting',
  'inconsiderate',
  'inquisitive',
  'jumpy',
  'normal',
  'obsessive',
  'open',
  'passive',
  'playful',
  'protective',
  'secretive',
  'timid',
] as const;
export type NpcOutlookType = (typeof OUTLOOK_TYPES)[number];

/** Creature archetypes (section 2.2), the profession of a creature. */
export const ARCHETYPES = [
  'offensive',
  'defensive',
  'stealth',
  'skill',
  'discipline',
  'spell-user',
  'semi-spell-user',
  'hybrid-spell-user',
] as const;
export type NpcArchetype = (typeof ARCHETYPES)[number];

/** Level spread codes of Table T-3.1b. */
export const LEVEL_SPREADS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type LevelSpread = (typeof LEVEL_SPREADS)[number];

/** Modes of movement of the stat block (Movement talents, chapter 4). */
export const MOVEMENT_MODES = [
  'walk',
  'walk-quadruped',
  'walk-multi',
  'wings',
  'wings-gliding',
  'magic-flight',
  'swim',
  'leap',
  'climb-claw',
  'climb-snake',
  'climb-grip',
  'climb-adhesive',
  'climb-cling',
  'burrow',
  'other',
] as const;
export type MovementMode = (typeof MOVEMENT_MODES)[number];

export const PACES = ['walk', 'jog', 'run', 'sprint', 'dash'] as const;
export type Pace = (typeof PACES)[number];

export const TIERS = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;
export type Tier = (typeof TIERS)[number];

/** Size categories of Table T-3.1c, in order: the index + 1 is the size class (medium = 5). Same ids as core. */
export const CREATURE_SIZES = [
  'minuscule',
  'diminutive',
  'tiny',
  'small',
  'medium',
  'big',
  'large',
  'huge',
  'gigantic',
  'enormous',
  'immense',
  'behemoth',
  'leviathan',
] as const;
export type CreatureSize = (typeof CREATURE_SIZES)[number];

/** The P* codes of Table T-3.1e: half damage and no critical from that kind of attack. */
export const CRITICAL_IMMUNITIES = ['no-grapple', 'no-krush', 'no-puncture', 'no-slash', 'no-strike', 'no-unbalance'] as const;
export type CriticalImmunity = (typeof CRITICAL_IMMUNITIES)[number];

/** Shield types of Core Law Table 9-6, the letter of the stat block (`T`, `N`, `F`, `W`). */
export const SHIELD_TYPES = ['target', 'normal', 'full', 'wall'] as const;
export type ShieldType = (typeof SHIELD_TYPES)[number];

/** DB each shield type adds (Table 9-6): the `db` of a shield the stat block gives only the type of. */
export const SHIELD_TYPE_DB: Readonly<Record<ShieldType, number>> = { target: 15, normal: 20, full: 25, wall: 30 };

/** Biome and location codes of Table T-3.1g. */
export const BIOMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'X', 'Z'] as const;
/** A lower-case `w` after a code is a body of water within that biome (`Fw`). */
export const BIOME_CODES = [...BIOMES, ...BIOMES.map(code => `${code}w` as const)];
export type Biome = (typeof BIOMES)[number] | `${(typeof BIOMES)[number]}w`;
