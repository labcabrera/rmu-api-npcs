import { ApiProperty, type ApiPropertyOptions, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ENCOUNTER_CONDITIONS,
  ENCOUNTER_ENTRY_TYPES,
  ENCOUNTER_ROLL_TYPES,
  ENCOUNTER_TABLE_KINDS,
  MODIFIER_SIDES,
  type EncounterCodes,
  type EncounterCondition,
  type EncounterEntryType,
  type EncounterRollType,
  type EncounterTableKind,
  type ModifierSide,
} from '../../../domain/value-objects/encounter-table.vo.js';

// Read models of the imported tables (spec 061). The handlers return the domain objects as they are: these classes
// only document them.

export class EncounterEntryDto {
  @ApiProperty({ enum: ENCOUNTER_ENTRY_TYPES, example: 'npc' })
  type: EncounterEntryType;

  @ApiPropertyOptional({ type: [String], description: 'npc: the creature, or the variants of a family (the first is the default)' })
  npcIds?: string[];

  @ApiPropertyOptional({ description: 'npc, race, event, text: the printed name' })
  label?: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'redirect: the target table, null for the region biome table' })
  tableId?: string | null;

  @ApiPropertyOptional({ description: 'redirect: bonus to the new roll', example: 100 })
  bonus?: number;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'race: a core race' })
  raceId?: string | null;

  @ApiPropertyOptional({ description: 'event: text key', example: 'blizzard' })
  key?: string;
}

export class EncounterRowDto {
  @ApiProperty({ type: Number, nullable: true, description: 'Null on the UM 66 row' })
  min: number | null;

  @ApiProperty({ type: Number, nullable: true, description: 'Null on the UM 66 row' })
  max: number | null;

  @ApiProperty()
  um66: boolean;

  @ApiProperty({ enum: ENCOUNTER_CONDITIONS, nullable: true })
  condition: EncounterCondition | null;

  @ApiProperty({ type: EncounterEntryDto })
  entry: EncounterEntryDto;
}

export class EncounterSubtableRangeDto {
  @ApiProperty({ example: 1 })
  min: number;

  @ApiProperty({ example: 100 })
  max: number;
}

export class EncounterSubtableDto extends EncounterSubtableRangeDto {
  @ApiProperty({ type: [EncounterRowDto] })
  rows: EncounterRowDto[];
}

class EncounterTableSourceDto {
  @ApiProperty({ example: 'creature-law-1' })
  book: string;

  @ApiProperty({ type: Number, nullable: true })
  page: number | null;
}

class EncounterTableBaseDto {
  @ApiProperty({ example: 'prairie' })
  id: string;

  @ApiProperty({ type: String, nullable: true, description: 'Code of Table T-3.1g, null for universal tables', example: 'P' })
  biome: string | null;

  @ApiProperty({ enum: ENCOUNTER_TABLE_KINDS })
  kind: EncounterTableKind;

  @ApiProperty({ enum: ENCOUNTER_ROLL_TYPES, description: 'open: open-ended d100 on 01-300; straight: d100 on 01-100' })
  roll: EncounterRollType;
}

export class EncounterTableSummaryDto extends EncounterTableBaseDto {
  @ApiProperty({ type: [EncounterSubtableRangeDto], description: 'd100 ranges of the subtables; one 1-100 when not split' })
  subtables: EncounterSubtableRangeDto[];
}

export class EncounterTableDto extends EncounterTableBaseDto {
  @ApiProperty({ type: [EncounterSubtableDto], description: 'Subtables picked by a d100; one 1-100 when not split' })
  subtables: EncounterSubtableDto[];

  @ApiProperty({ type: EncounterTableSourceDto, nullable: true })
  source: EncounterTableSourceDto | null;
}

export class EncounterModifierDto {
  @ApiProperty({ example: 'party-5-10' })
  key: string;

  @ApiProperty({ enum: MODIFIER_SIDES })
  side: ModifierSide;

  @ApiProperty({ type: String, nullable: true, description: 'The options of a group are exclusive', example: 'party-size' })
  group: string | null;

  @ApiProperty({ type: Number, nullable: true, description: 'Null: variable, entered by the GM', example: -20 })
  value: number | null;
}

const CODES: ApiPropertyOptions = {
  type: [String],
  nullable: true,
  description: '[social, creature] codes, null is "--"',
  example: ['b', 's'],
};

export class EncounterDifferentialDto {
  @ApiProperty({ example: 91 })
  min: number;

  @ApiProperty({ type: Number, nullable: true, description: 'Null on the last row', example: 100 })
  max: number | null;

  @ApiProperty(CODES)
  dense: EncounterCodes;

  @ApiProperty(CODES)
  moderate: EncounterCodes;

  @ApiProperty(CODES)
  light: EncounterCodes;

  @ApiProperty(CODES)
  uninhabited: EncounterCodes;

  @ApiProperty(CODES)
  waste: EncounterCodes;
}

export class EncounterSpecialDto {
  @ApiProperty({ example: 'wild' })
  key: string;

  @ApiProperty({ type: [String], example: ['prairie', 'savanna'] })
  tableIds: string[];
}

export class EncounterSettingsDto {
  @ApiProperty({ example: 'creature-law-1' })
  id: string;

  @ApiProperty({ type: [EncounterModifierDto], description: 'Table 15.4a' })
  modifiers: EncounterModifierDto[];

  @ApiProperty({ type: [EncounterDifferentialDto], description: 'Table 15.4b' })
  differentials: EncounterDifferentialDto[];

  @ApiProperty({ type: [EncounterSpecialDto], description: 'Table 15.4c' })
  specials: EncounterSpecialDto[];
}
