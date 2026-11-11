import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import type {
  EncounterRollType,
  EncounterSubtable,
  EncounterTableKind,
  EncounterTableSource,
} from '../../../domain/value-objects/encounter-table.vo.js';

export type EncounterTableDocument = HydratedDocument<EncounterTableModel>;

/** Imported by the data script, never written by the API (spec 061). */
@Schema({ collection: 'encounter-tables', versionKey: false, minimize: false })
export class EncounterTableModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: String, required: false })
  biome: string | null;

  @Prop({ type: String, required: true })
  kind: EncounterTableKind;

  @Prop({ type: String, required: true })
  roll: EncounterRollType;

  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  subtables: EncounterSubtable[];

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  source: EncounterTableSource | null;
}

export const EncounterTableSchema = SchemaFactory.createForClass(EncounterTableModel);
