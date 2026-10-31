import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import type {
  EncounterCheckResult,
  EncounterNextStep,
  EncounterPathStep,
  ResolveEncounterRequest,
} from '../../../domain/services/resolve-encounter.js';
import {
  ENCOUNTER_CONDITIONS,
  ENCOUNTER_ROLL_TYPES,
  POPULATIONS,
  type EncounterCondition,
  type EncounterRollType,
  type Population,
} from '../../../domain/value-objects/encounter-table.vo.js';
import { EncounterEntryDto } from './encounter-table.dto.js';

/** Rolls of one resolution: subtables and creatures of a few chained tables. */
const MAX_ROLLS = 20;

export class EncounterModifierChoiceDto {
  @ApiProperty({ description: 'Key of a modifier of the settings', example: 'party-5-10' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Required by variable modifiers, ignored by the others', example: 15 })
  @IsOptional()
  @IsInt()
  value?: number | null;
}

export class EncounterSideRollDto {
  @ApiProperty({ description: 'Open-ended d100 total', example: 32 })
  @IsInt()
  roll: number;

  @ApiPropertyOptional({ type: [EncounterModifierChoiceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EncounterModifierChoiceDto)
  modifiers?: EncounterModifierChoiceDto[];
}

export class EncounterCheckRequestDto {
  @ApiProperty({ enum: POPULATIONS, example: 'light' })
  @IsIn(POPULATIONS)
  population: Population;

  @ApiProperty({ type: EncounterSideRollDto, description: 'Rolled by a player' })
  @ValidateNested()
  @Type(() => EncounterSideRollDto)
  avoidance: EncounterSideRollDto;

  @ApiProperty({ type: EncounterSideRollDto, description: 'Rolled by the GM' })
  @ValidateNested()
  @Type(() => EncounterSideRollDto)
  activity: EncounterSideRollDto;
}

export class ResolveEncounterDto {
  @ApiPropertyOptional({ type: EncounterCheckRequestDto, nullable: true, description: 'Omit to go straight to the creature' })
  @IsOptional()
  @ValidateNested()
  @Type(() => EncounterCheckRequestDto)
  check?: EncounterCheckRequestDto | null;

  @ApiProperty({ example: 'prairie' })
  @IsString()
  @IsNotEmpty()
  tableId: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Biome or location table of "Roll on Biome Table"; defaults to tableId when that is a biome table',
    example: 'prairie',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  regionTableId?: string | null;

  @ApiPropertyOptional({ type: Boolean, nullable: true, description: 'False: the rows that need water are unmet' })
  @IsOptional()
  @IsBoolean()
  water?: boolean | null;

  @ApiPropertyOptional({ type: Boolean, nullable: true, description: 'False: the rows that need land are unmet' })
  @IsOptional()
  @IsBoolean()
  land?: boolean | null;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'GM bonus to open creature rolls, kept on redirects', example: 0 })
  @IsOptional()
  @IsInt()
  creatureModifier?: number | null;

  @ApiPropertyOptional({ type: [Number], description: 'Subtable d100s and creature rolls, in order', example: [62, 58] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_ROLLS)
  @IsInt({ each: true })
  rolls?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'The unmodified dice of the same rolls (UM 66)', example: [62, 58] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_ROLLS)
  @IsInt({ each: true })
  unmodified?: number[];

  static toRequest(dto: ResolveEncounterDto): ResolveEncounterRequest {
    return { ...dto };
  }
}

export class EncounterCheckResultDto implements EncounterCheckResult {
  @ApiProperty({ description: 'Adjusted avoidance total', example: 12 })
  avoidance: number;

  @ApiProperty({ description: 'Adjusted activity total', example: 107 })
  activity: number;

  @ApiProperty({ description: 'Activity minus avoidance', example: 95 })
  differential: number;

  @ApiProperty({ description: 'Differential of 1 or more' })
  encounter: boolean;

  @ApiProperty({ type: String, nullable: true, description: 'Code of Table 15.4b for the inhabitants, null is "--"', example: 'b' })
  social: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'Code of Table 15.4b for the creatures, null is "--"', example: 's' })
  creature: string | null;
}

class EncounterRangeDto {
  @ApiProperty({ type: Number, nullable: true })
  min: number | null;

  @ApiProperty({ type: Number, nullable: true })
  max: number | null;
}

export class EncounterPathStepDto implements EncounterPathStep {
  @ApiProperty({ example: 'prairie' })
  tableId: string;

  @ApiProperty({ type: EncounterRangeDto, description: 'd100 range of the subtable used' })
  subtable: { min: number; max: number };

  @ApiProperty({ type: Number, nullable: true, description: 'The d100 that picked the subtable, null when not split' })
  subtableRoll: number | null;

  @ApiProperty({ description: 'The creature roll sent', example: 58 })
  roll: number;

  @ApiProperty({ description: 'The roll plus creatureModifier and the redirect bonus (open tables only)', example: 58 })
  adjustedRoll: number;

  @ApiProperty({ type: EncounterRangeDto, description: 'Range of the row; null on the UM 66 row' })
  row: { min: number | null; max: number | null };

  @ApiProperty({ enum: ['low', 'high'], nullable: true, description: 'The roll was outside the table and took its first or last row' })
  clamped: 'low' | 'high' | null;
}

export class EncounterNextStepDto implements EncounterNextStep {
  @ApiProperty({ enum: ['subtable', 'creature'] })
  step: 'subtable' | 'creature';

  @ApiProperty({ example: 'universal-monsters' })
  tableId: string;

  @ApiProperty({ enum: ENCOUNTER_ROLL_TYPES })
  roll: EncounterRollType;

  @ApiProperty({ description: 'Bonus of the redirect, added with creatureModifier to an open roll', example: 100 })
  bonus: number;
}

class EncounterSpecialKeyDto {
  @ApiProperty({ example: 'wild' })
  key: string;
}

export class EncounterResultDto {
  @ApiProperty({ type: EncounterEntryDto })
  entry: EncounterEntryDto;

  @ApiProperty({ description: 'An unmodified 66: a special situation' })
  um66: boolean;

  @ApiProperty({ type: EncounterSpecialKeyDto, nullable: true, description: 'Suggestion of Table 15.4c for the table' })
  special: { key: string } | null;

  @ApiProperty({ enum: ENCOUNTER_CONDITIONS, nullable: true, description: 'The row needs water or land and the request has none' })
  conditionUnmet: EncounterCondition | null;
}

export class ResolveEncounterResponseDto {
  @ApiProperty({ type: EncounterCheckResultDto, nullable: true, description: 'Null when no check was sent' })
  check: EncounterCheckResultDto | null;

  @ApiProperty({ type: [EncounterPathStepDto], description: 'Tables walked, with the roll used on each' })
  path: EncounterPathStepDto[];

  @ApiProperty({ type: EncounterNextStepDto, nullable: true, description: 'The roll still missing; null with a result' })
  next: EncounterNextStepDto | null;

  @ApiProperty({ type: EncounterResultDto, nullable: true, description: 'Null while a roll is missing or with no encounter' })
  result: EncounterResultDto | null;
}
