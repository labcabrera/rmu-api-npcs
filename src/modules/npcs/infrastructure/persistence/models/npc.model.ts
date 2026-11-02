import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import type { AccessType } from '../../../../shared/domain/entities/access-type.js';
import type { NpcItem } from '../../../domain/aggregates/npc-props.js';
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
import type { CreatureSize, LevelSpread, NpcArchetype, NpcCategory, NpcOutlookType } from '../../../domain/value-objects/npc-types.vo.js';

export type NpcDocument = HydratedDocument<NpcModel>;

/** The stat block blocks are stored as plain objects: the DTOs validate their shape (spec 054). */
const Mixed = MongooseSchema.Types.Mixed;

@Schema({ collection: 'npcs', versionKey: false, minimize: false })
export class NpcModel {
  @Prop({ required: true })
  _id: string;

  /** Optimistic concurrency: +1 on each write. Documents stored before it existed have none (version 0). */
  @Prop({ type: Number, default: 0 })
  version: number;

  @Prop({ type: String, required: true })
  realmId: string;

  @Prop({ type: String, required: false })
  accessType: AccessType;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  category: NpcCategory;

  @Prop({ type: String, required: false })
  type: string | null;

  @Prop({ type: String, required: false })
  group: string | null;

  @Prop({ type: Number, required: true })
  level: number;

  @Prop({ type: String, required: false })
  levelSpread: LevelSpread | null;

  @Prop({ type: String, required: false })
  outlookType: NpcOutlookType | null;

  @Prop({ type: Number, required: false })
  frightLevel: number | null;

  @Prop({ type: String, required: false })
  archetype: NpcArchetype | null;

  @Prop({ type: [Mixed], required: false })
  movement: NpcMovement[];

  @Prop({ type: Number, required: false })
  endurance: number | null;

  @Prop({ type: String, required: false })
  size: CreatureSize;

  @Prop({ type: String, required: false })
  criticalSize: CreatureSize | null;

  @Prop({ type: Mixed, required: false })
  criticalCodes: NpcCriticalCodes;

  @Prop({ type: Number, required: true })
  hp: number;

  @Prop({ type: Number, required: false })
  deathHits: number | null;

  @Prop({ type: Number, required: true })
  at: number;

  @Prop({ type: Number, required: true })
  db: number;

  @Prop({ type: Mixed, required: false })
  running: NpcRunning | null;

  @Prop({ type: Mixed, required: false })
  shield: NpcShield | null;

  @Prop({ type: Number, required: true })
  initiative: number;

  @Prop({ type: [Mixed], required: false })
  attacks: NpcAttack[];

  @Prop({ type: Number, required: false })
  powerPoints: number | null;

  @Prop({ type: Mixed, required: false })
  resistances: NpcResistances | null;

  @Prop({ type: [Mixed], required: false })
  skills: NpcSkill[];

  @Prop({ type: Mixed, required: false })
  encounter: NpcEncounter | null;

  @Prop({ type: Mixed, required: false })
  stats: NpcStats | null;

  @Prop({ type: Mixed, required: false })
  details: NpcDetails | null;

  @Prop({ type: [Mixed], required: false })
  talents: NpcTalent[];

  @Prop({ type: [Mixed], required: false })
  items: NpcItem[];

  @Prop({ type: Mixed, required: false })
  source: NpcSource | null;

  @Prop({ type: String, required: false })
  description: string | null;

  @Prop({ type: String, required: false })
  imageUrl: string | null;

  @Prop({ type: String, required: true })
  owner: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date | null;
}

export const NpcSchema = SchemaFactory.createForClass(NpcModel);
