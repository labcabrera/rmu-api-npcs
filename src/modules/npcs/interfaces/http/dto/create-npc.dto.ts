import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, Min, ValidateNested } from 'class-validator';
import { CreateNpcCommand } from '../../../application/cqrs/commands/create-npc.command.js';
import type { NpcCreationProps, NpcUpdateProps } from '../../../domain/aggregates/npc-props.js';
import { MAX_FRIGHT_LEVEL, MIN_FRIGHT_LEVEL, Npc } from '../../../domain/aggregates/npc.aggregate.js';
import {
  ARCHETYPES,
  CREATURE_SIZES,
  LEVEL_SPREADS,
  NPC_CATEGORIES,
  OUTLOOK_TYPES,
  type CreatureSize,
  type LevelSpread,
  type NpcArchetype,
  type NpcCategory,
  type NpcOutlookType,
} from '../../../domain/value-objects/npc-types.vo.js';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';
import {
  NpcAttackDto,
  NpcCriticalCodesDto,
  NpcDetailsDto,
  NpcEncounterDto,
  NpcItemDto,
  NpcMovementDto,
  NpcResistancesDto,
  NpcRunningDto,
  NpcShieldDto,
  NpcSkillDto,
  NpcStatsDto,
  NpcTalentDto,
} from './npc-stat-block.dto.js';

/** The ids of core: letters, digits, dashes and underscores (UUIDs and the old slugs). */
export const REALM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export class CreateNpcDto {
  @ApiProperty({ description: 'Realm identifier from core module', example: 'ad49b7af-7a26-44f9-b004-11afe0fba79a' })
  @IsString()
  // An id of core: it goes in the URL of the realm check, so no slashes or dots.
  @Matches(REALM_ID_PATTERN, { message: 'realmId must be an id: letters, digits, - and _' })
  realmId: string;

  @ApiPropertyOptional({ enum: ['public', 'private'], description: 'Public NPCs are the catalog (admin only)', default: 'private' })
  @IsOptional()
  @IsIn(['public', 'private'])
  accessType: AccessType | undefined;

  @ApiProperty({ example: 'Bear, black' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: NPC_CATEGORIES, example: 'animal' })
  @IsIn(NPC_CATEGORIES)
  category: NpcCategory;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Book section', example: 'carnivore' })
  @IsOptional()
  @IsString()
  type: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'Group of the section', example: 'bear' })
  @IsOptional()
  @IsString()
  group: string | null;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  level: number;

  @ApiPropertyOptional({ enum: LEVEL_SPREADS, nullable: true })
  @IsOptional()
  @IsIn(LEVEL_SPREADS)
  levelSpread: LevelSpread | null;

  @ApiPropertyOptional({ enum: OUTLOOK_TYPES, nullable: true })
  @IsOptional()
  @IsIn(OUTLOOK_TYPES)
  outlookType: NpcOutlookType | null;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    minimum: MIN_FRIGHT_LEVEL,
    maximum: MAX_FRIGHT_LEVEL,
    description: 'Fright level of the creature: the base of the fear check it causes (spec 068)',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(MIN_FRIGHT_LEVEL)
  @Max(MAX_FRIGHT_LEVEL)
  frightLevel: number | null;

  @ApiPropertyOptional({ enum: ARCHETYPES, nullable: true })
  @IsOptional()
  @IsIn(ARCHETYPES)
  archetype: NpcArchetype | null;

  @ApiPropertyOptional({ type: [NpcMovementDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NpcMovementDto)
  movement: NpcMovementDto[] | undefined;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  endurance: number | null;

  @ApiProperty({ enum: CREATURE_SIZES, example: 'medium' })
  @IsIn(CREATURE_SIZES)
  size: CreatureSize;

  @ApiPropertyOptional({ enum: CREATURE_SIZES, nullable: true, description: 'Size for criticals when it differs' })
  @IsOptional()
  @IsIn(CREATURE_SIZES)
  criticalSize: CreatureSize | null;

  @ApiPropertyOptional({ type: NpcCriticalCodesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NpcCriticalCodesDto)
  criticalCodes: NpcCriticalCodesDto | undefined;

  @ApiProperty({ example: 80 })
  @IsInt()
  @Min(1)
  hp: number;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Hit total at which the creature dies', example: 110 })
  @IsOptional()
  @IsInt()
  @Min(1)
  deathHits: number | null;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  at: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  db: number;

  @ApiPropertyOptional({ type: NpcRunningDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NpcRunningDto)
  running: NpcRunningDto | null;

  @ApiPropertyOptional({ type: NpcShieldDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NpcShieldDto)
  shield: NpcShieldDto | null;

  @ApiProperty({ example: 2 })
  @IsNumber()
  initiative: number;

  @ApiPropertyOptional({ type: [NpcAttackDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NpcAttackDto)
  attacks: NpcAttackDto[] | undefined;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  powerPoints: number | null;

  @ApiPropertyOptional({ type: NpcResistancesDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NpcResistancesDto)
  resistances: NpcResistancesDto | null;

  @ApiPropertyOptional({ type: [NpcSkillDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NpcSkillDto)
  skills: NpcSkillDto[] | undefined;

  @ApiPropertyOptional({ type: NpcEncounterDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NpcEncounterDto)
  encounter: NpcEncounterDto | null;

  @ApiPropertyOptional({ type: NpcStatsDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NpcStatsDto)
  stats: NpcStatsDto | null;

  @ApiPropertyOptional({ type: NpcDetailsDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NpcDetailsDto)
  details: NpcDetailsDto | null;

  @ApiPropertyOptional({ type: [NpcTalentDto], description: 'Informational only (spec 054)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NpcTalentDto)
  talents: NpcTalentDto[] | undefined;

  @ApiPropertyOptional({ type: [NpcItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NpcItemDto)
  items: NpcItemDto[] | undefined;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  imageUrl: string | null;

  static toCommand(dto: CreateNpcDto, userId: string, roles: string[]): CreateNpcCommand {
    const defaults: Omit<
      NpcCreationProps,
      'owner' | 'realmId' | 'source' | 'name' | 'category' | 'level' | 'size' | 'hp' | 'at' | 'db' | 'initiative'
    > = {
      accessType: 'private',
      type: null,
      group: null,
      levelSpread: null,
      outlookType: null,
      frightLevel: null,
      archetype: null,
      movement: [],
      endurance: null,
      criticalSize: null,
      criticalCodes: Npc.emptyCriticalCodes(),
      deathHits: null,
      running: null,
      shield: null,
      attacks: [],
      powerPoints: null,
      resistances: null,
      skills: [],
      encounter: null,
      stats: null,
      details: null,
      talents: [],
      items: [],
      description: null,
      imageUrl: null,
    };
    const props: Omit<NpcCreationProps, 'owner'> = {
      ...defaults,
      ...(toNpcProps(dto) as Omit<NpcCreationProps, 'owner' | 'source' | 'realmId'>),
      realmId: dto.realmId,
      source: null,
    };
    return new CreateNpcCommand(props, userId, roles);
  }
}

/**
 * The domain values of the fields a DTO sends. Absent fields are left out; null clears a nullable field and is ignored
 * on a required one (name, size, hits…) and on the lists, so the PATCH keeps the stored value.
 */
export function toNpcProps(dto: Partial<CreateNpcDto>): NpcUpdateProps {
  const props: NpcUpdateProps = {};
  const set = <K extends keyof NpcUpdateProps>(key: K, value: NpcUpdateProps[K] | undefined) => {
    if (value !== undefined) props[key] = value;
  };
  const nullable = <T, R>(value: T | null | undefined, map: (v: T) => R): R | null | undefined =>
    value === undefined ? undefined : value === null ? null : map(value);
  const required = <T, R>(value: T | null | undefined, map: (v: T) => R): R | undefined =>
    value === undefined || value === null ? undefined : map(value);
  const same = <T>(v: T) => v;

  set('accessType', required(dto.accessType, same));
  set('name', required(dto.name, same));
  set('category', required(dto.category, same));
  set('type', nullable(dto.type, same));
  set('group', nullable(dto.group, same));
  set('level', required(dto.level, same));
  set('levelSpread', nullable(dto.levelSpread, same));
  set('outlookType', nullable(dto.outlookType, same));
  set('frightLevel', nullable(dto.frightLevel, same));
  set('archetype', nullable(dto.archetype, same));
  set(
    'movement',
    required(dto.movement, list => list.map(m => NpcMovementDto.toEntity(m))),
  );
  set('endurance', nullable(dto.endurance, same));
  set('size', required(dto.size, same));
  set('criticalSize', nullable(dto.criticalSize, same));
  set(
    'criticalCodes',
    required(dto.criticalCodes, c => NpcCriticalCodesDto.toEntity(c)),
  );
  set('hp', required(dto.hp, same));
  set('deathHits', nullable(dto.deathHits, same));
  set('at', required(dto.at, same));
  set('db', required(dto.db, same));
  set(
    'running',
    nullable(dto.running, r => ({ ranks: r.ranks, bonus: r.bonus })),
  );
  set(
    'shield',
    nullable(dto.shield, s => NpcShieldDto.toEntity(s)),
  );
  set('initiative', required(dto.initiative, same));
  set(
    'attacks',
    required(dto.attacks, list => list.map(a => NpcAttackDto.toEntity(a))),
  );
  set('powerPoints', nullable(dto.powerPoints, same));
  set(
    'resistances',
    nullable(dto.resistances, r => ({ ...r })),
  );
  set(
    'skills',
    required(dto.skills, list => list.map(s => NpcSkillDto.toEntity(s))),
  );
  set(
    'encounter',
    nullable(dto.encounter, e => NpcEncounterDto.toEntity(e)),
  );
  set(
    'stats',
    nullable(dto.stats, s => ({ ...s })),
  );
  set(
    'details',
    nullable(dto.details, d => NpcDetailsDto.toEntity(d)),
  );
  set(
    'talents',
    required(dto.talents, list => list.map(t => NpcTalentDto.toEntity(t))),
  );
  set(
    'items',
    required(dto.items, list => list.map(i => NpcItemDto.toEntity(i))),
  );
  set('description', nullable(dto.description, same));
  set('imageUrl', nullable(dto.imageUrl, same));
  return props;
}
