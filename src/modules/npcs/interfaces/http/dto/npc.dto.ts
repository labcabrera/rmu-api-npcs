import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';
import { PaginationDto } from '../../../../shared/interfaces/http/dto/page.dto.js';
import type { NpcItem } from '../../../domain/aggregates/npc-props.js';
import type { NpcView } from '../../../application/cqrs/npc-view.js';
import type { NpcAccess } from '../../../domain/services/npc-access.js';
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
} from '../../../domain/value-objects/npc-stat-block.vo.js';
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
  NpcSourceDto,
  NpcStatsDto,
  NpcTalentDto,
} from './npc-stat-block.dto.js';

export class NpcDto {
  @ApiProperty({ example: '6a1f0e8e-…' }) id: string;
  @ApiProperty({ description: 'Version of optimistic concurrency: send it back in the PATCH', example: 0 }) version: number;
  @ApiProperty({ type: String, nullable: true, description: 'Null for a global NPC: everyone reads it, only admins manage it' })
  realmId: string | null;
  @ApiProperty({ enum: ['public', 'private'] }) accessType: AccessType;
  @ApiProperty() name: string;
  @ApiProperty({ enum: NPC_CATEGORIES }) category: NpcCategory;
  @ApiPropertyOptional({ type: String, nullable: true }) type: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) group: string | null;
  @ApiProperty() level: number;
  @ApiPropertyOptional({ enum: LEVEL_SPREADS, nullable: true }) levelSpread: LevelSpread | null;
  @ApiPropertyOptional({ enum: OUTLOOK_TYPES, nullable: true }) outlookType: NpcOutlookType | null;
  @ApiPropertyOptional({ type: Number, nullable: true, minimum: 0, maximum: 30, description: 'Fright level (spec 068)' })
  frightLevel: number | null;
  @ApiPropertyOptional({ enum: ARCHETYPES, nullable: true }) archetype: NpcArchetype | null;
  @ApiProperty({ type: [NpcMovementDto] }) movement: NpcMovement[];
  @ApiPropertyOptional({ type: Number, nullable: true }) endurance: number | null;
  @ApiProperty({ enum: CREATURE_SIZES }) size: CreatureSize;
  @ApiPropertyOptional({ enum: CREATURE_SIZES, nullable: true }) criticalSize: CreatureSize | null;
  @ApiProperty({ type: NpcCriticalCodesDto }) criticalCodes: NpcCriticalCodes;
  @ApiProperty() hp: number;
  @ApiPropertyOptional({ type: Number, nullable: true }) deathHits: number | null;
  @ApiProperty() at: number;
  @ApiProperty() db: number;
  @ApiPropertyOptional({ type: NpcRunningDto, nullable: true }) running: NpcRunning | null;
  @ApiPropertyOptional({ type: NpcShieldDto, nullable: true }) shield: NpcShield | null;
  @ApiProperty() initiative: number;
  @ApiProperty({ type: [NpcAttackDto] }) attacks: NpcAttack[];
  @ApiPropertyOptional({ type: Number, nullable: true }) powerPoints: number | null;
  @ApiPropertyOptional({ type: NpcResistancesDto, nullable: true }) resistances: NpcResistances | null;
  @ApiProperty({ type: [NpcSkillDto] }) skills: NpcSkill[];
  @ApiPropertyOptional({ type: NpcEncounterDto, nullable: true }) encounter: NpcEncounter | null;
  @ApiPropertyOptional({ type: NpcStatsDto, nullable: true }) stats: NpcStats | null;
  @ApiPropertyOptional({ type: NpcDetailsDto, nullable: true }) details: NpcDetails | null;
  @ApiProperty({ type: [NpcTalentDto] }) talents: NpcTalent[];
  @ApiProperty({ type: [NpcItemDto] }) items: NpcItem[];
  @ApiPropertyOptional({ type: NpcSourceDto, nullable: true }) source: NpcSource | null;
  @ApiPropertyOptional({ type: String, nullable: true }) description: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) imageUrl: string | null;
  @ApiProperty({ description: 'Who created it: it gives no permission, the realm decides (spec 073)' }) owner: string;
  @ApiProperty() createdAt: Date;
  @ApiPropertyOptional({ type: Date, nullable: true }) updatedAt: Date | null;
  @ApiProperty({
    enum: ['read', 'write', 'manage'],
    description: 'What the caller can do with it, from its level on the realm (spec 073): write changes and deletes it',
  })
  access: NpcAccess;

  static fromView({ npc, access }: NpcView): NpcDto {
    return Object.assign(new NpcDto(), npc.getProps(), { version: npc.version, access });
  }
}

export class NpcPageDto {
  @ApiProperty({ type: [NpcDto], description: 'NPCs' })
  content!: NpcDto[];

  @ApiProperty({ type: PaginationDto, description: 'Pagination information' })
  pagination!: PaginationDto;
}
