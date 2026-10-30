import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import type { NpcItem } from '../../../domain/aggregates/npc-props.js';
import type {
  NpcAttack,
  NpcCriticalCodes,
  NpcDetails,
  NpcEncounter,
  NpcMovement,
  NpcPoison,
  NpcResistances,
  NpcRunning,
  NpcShield,
  NpcSkill,
  NpcSource,
  NpcStats,
  NpcTalent,
} from '../../../domain/value-objects/npc-stat-block.vo.js';
import {
  BIOMES,
  CREATURE_SIZES,
  CRITICAL_IMMUNITIES,
  MOVEMENT_MODES,
  PACES,
  TIERS,
  type Biome,
  type CriticalImmunity,
  type MovementMode,
  type Pace,
  type Tier,
} from '../../../domain/value-objects/npc-types.vo.js';

// The blocks of the Combat Stat Block (spec 054). The global ValidationPipe strips unknown fields, so every field is
// declared; optional ones default to null in toEntity.

export class NpcMovementDto implements NpcMovement {
  @ApiProperty({ enum: MOVEMENT_MODES, example: 'walk-quadruped' })
  @IsIn(MOVEMENT_MODES)
  mode: MovementMode;

  @ApiPropertyOptional({ enum: TIERS, nullable: true, description: 'Tier of the movement talent (wings, swimming…)' })
  @IsOptional()
  @IsIn(TIERS)
  tier: Tier | null;

  @ApiProperty({ description: 'Base movement rate, feet per round', example: 49 })
  @IsNumber()
  @Min(0)
  baseRate: number;

  @ApiProperty({ enum: PACES, example: 'dash' })
  @IsIn(PACES)
  maxPace: Pace;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  note: string | null;

  static toEntity(dto: NpcMovementDto): NpcMovement {
    return { mode: dto.mode, tier: dto.tier ?? null, baseRate: dto.baseRate, maxPace: dto.maxPace, note: dto.note ?? null };
  }
}

export class NpcCriticalCodesDto implements NpcCriticalCodes {
  @ApiProperty({ description: '`I`: every critical is one severity lower' })
  @IsBoolean()
  reduceSeverity: boolean;

  @ApiProperty({ description: '`!`: cannot be staggered, knocked back or down' })
  @IsBoolean()
  noKnockdown: boolean;

  @ApiProperty({ description: '`@`: immune to stun' })
  @IsBoolean()
  stunImmune: boolean;

  @ApiProperty({ description: '`#`: immune to bleeding' })
  @IsBoolean()
  bleedImmune: boolean;

  @ApiProperty({ enum: CRITICAL_IMMUNITIES, isArray: true })
  @IsArray()
  @IsIn(CRITICAL_IMMUNITIES, { each: true })
  immunities: CriticalImmunity[];

  static toEntity(dto: NpcCriticalCodesDto): NpcCriticalCodes {
    return {
      reduceSeverity: dto.reduceSeverity,
      noKnockdown: dto.noKnockdown,
      stunImmune: dto.stunImmune,
      bleedImmune: dto.bleedImmune,
      immunities: [...dto.immunities],
    };
  }
}

export class NpcRunningDto implements NpcRunning {
  @ApiProperty({ example: 6 })
  @IsInt()
  @Min(0)
  ranks: number;

  @ApiProperty({ example: 44 })
  @IsNumber()
  bonus: number;
}

export class NpcShieldDto implements NpcShield {
  @ApiProperty({ example: 'normal' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  ranks: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  bonus: number;
}

export class NpcPoisonDto implements NpcPoison {
  @ApiProperty({ example: 'nerve' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: -20 })
  @IsNumber()
  rrModifier: number;
}

export class NpcAttackDto implements NpcAttack {
  @ApiProperty({ example: 23 })
  @IsNumber()
  ob: number;

  @ApiProperty({ description: 'Size class of the attack, 1-13 (medium = 5)', example: 6 })
  @IsInt()
  @Min(1)
  @Max(CREATURE_SIZES.length)
  size: number;

  @ApiProperty({ description: 'Attack table id of rmu-api-attack-tables', example: 'bite' })
  @IsString()
  @IsNotEmpty()
  attackTable: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'animals' })
  @IsOptional()
  @IsString()
  fumbleTable: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Critical type of the additional critical', example: 'cold' })
  @IsOptional()
  @IsString()
  additionalCritical: string | null;

  @ApiPropertyOptional({ enum: ['single', 'double'], nullable: true, description: '`>` (single) or `>>` (double)' })
  @IsOptional()
  @IsIn(['single', 'double'])
  sequence: 'single' | 'double' | null;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Creatures needed for a cooperative attack' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cooperation: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Number of attacks of the kata' })
  @IsOptional()
  @IsInt()
  @Min(1)
  kata: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Index of the attack this one is an alternative of' })
  @IsOptional()
  @IsInt()
  @Min(0)
  alternativeTo: number | null;

  @ApiPropertyOptional({ type: NpcPoisonDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NpcPoisonDto)
  poison: NpcPoisonDto | null;

  @ApiPropertyOptional({ enum: ['left'], nullable: true })
  @IsOptional()
  @IsIn(['left'])
  hand: 'left' | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'The notation as printed', example: '23B(6)bi' })
  @IsOptional()
  @IsString()
  notation: string | null;

  static toEntity(dto: NpcAttackDto): NpcAttack {
    return {
      ob: dto.ob,
      size: dto.size,
      attackTable: dto.attackTable,
      fumbleTable: dto.fumbleTable ?? null,
      additionalCritical: dto.additionalCritical ?? null,
      sequence: dto.sequence ?? null,
      cooperation: dto.cooperation ?? null,
      kata: dto.kata ?? null,
      alternativeTo: dto.alternativeTo ?? null,
      poison: dto.poison ? { type: dto.poison.type, rrModifier: dto.poison.rrModifier } : null,
      hand: dto.hand ?? null,
      notation: dto.notation ?? null,
    };
  }
}

export class NpcSkillDto implements NpcSkill {
  @ApiProperty({ description: 'Skill id of core', example: 'perception' })
  @IsString()
  @IsNotEmpty()
  skillId: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'intimidation' })
  @IsOptional()
  @IsString()
  specialization: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  ranks: number | null;

  @ApiProperty({ description: 'Total bonus', example: 40 })
  @IsNumber()
  bonus: number;

  @ApiPropertyOptional({ type: String, nullable: true, example: '+5 smell' })
  @IsOptional()
  @IsString()
  note: string | null;

  static toEntity(dto: NpcSkillDto): NpcSkill {
    return {
      skillId: dto.skillId,
      specialization: dto.specialization ?? null,
      ranks: dto.ranks ?? null,
      bonus: dto.bonus,
      note: dto.note ?? null,
    };
  }
}

export class NpcResistancesDto implements NpcResistances {
  @ApiProperty() @IsNumber() channeling: number;
  @ApiProperty() @IsNumber() essence: number;
  @ApiProperty() @IsNumber() mentalism: number;
  @ApiProperty() @IsNumber() physical: number;
  @ApiProperty() @IsNumber() fear: number;
}

export class NpcStatsDto implements NpcStats {
  @ApiProperty() @IsNumber() ag: number;
  @ApiProperty() @IsNumber() co: number;
  @ApiProperty() @IsNumber() em: number;
  @ApiProperty() @IsNumber() in: number;
  @ApiProperty() @IsNumber() me: number;
  @ApiProperty() @IsNumber() pr: number;
  @ApiProperty() @IsNumber() qu: number;
  @ApiProperty() @IsNumber() re: number;
  @ApiProperty() @IsNumber() sd: number;
  @ApiProperty() @IsNumber() st: number;
}

export class NpcEncounterDto implements NpcEncounter {
  @ApiProperty({ example: 'Pack' })
  @IsString()
  @IsNotEmpty()
  group: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '2d5' })
  @IsOptional()
  @IsString()
  dice: string | null;

  @ApiProperty({ enum: BIOMES, isArray: true })
  @IsArray()
  @IsIn(BIOMES, { each: true })
  biomes: Biome[];

  @ApiPropertyOptional({ type: Number, nullable: true, example: -10 })
  @IsOptional()
  @IsNumber()
  frequency: number | null;

  static toEntity(dto: NpcEncounterDto): NpcEncounter {
    return { group: dto.group, dice: dto.dice ?? null, biomes: [...dto.biomes], frequency: dto.frequency ?? null };
  }
}

export class NpcDetailsDto implements NpcDetails {
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() variants: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() height: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() armorDescription: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() treasure: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() magicRealm: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() misc: string | null;

  static toEntity(dto: NpcDetailsDto): NpcDetails {
    return {
      variants: dto.variants ?? null,
      height: dto.height ?? null,
      armorDescription: dto.armorDescription ?? null,
      treasure: dto.treasure ?? null,
      magicRealm: dto.magicRealm ?? null,
      misc: dto.misc ?? null,
    };
  }
}

export class NpcTalentDto implements NpcTalent {
  @ApiProperty({ example: 'Natural Weapon' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() tier: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() params: string | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) @IsOptional() @IsNumber() dp: number | null;

  static toEntity(dto: NpcTalentDto): NpcTalent {
    return { name: dto.name, tier: dto.tier ?? null, params: dto.params ?? null, dp: dto.dp ?? null };
  }
}

export class NpcItemDto implements NpcItem {
  @ApiProperty({ example: 'Torch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Item type id of rmu-api-items' })
  @IsOptional()
  @IsString()
  itemTypeId: string | null;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  amount: number;

  static toEntity(dto: NpcItemDto): NpcItem {
    return { name: dto.name, itemTypeId: dto.itemTypeId ?? null, amount: dto.amount };
  }
}

/** Read only: set by the import of the book data, not by the API. */
export class NpcSourceDto implements NpcSource {
  @ApiProperty({ example: 'creature-law-1' })
  book: string;

  @ApiProperty({ example: 'black-bear' })
  key: string;

  @ApiPropertyOptional({ type: Number, nullable: true })
  page: number | null;
}
