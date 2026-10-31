import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import type { EncounterDifferential, EncounterModifier, EncounterSpecial } from '../../../domain/value-objects/encounter-table.vo.js';

export type EncounterSettingsDocument = HydratedDocument<EncounterSettingsModel>;

/** Tables 15.4a-c, one document imported by the data script and never written by the API (spec 061). */
@Schema({ collection: 'encounter-settings', versionKey: false, minimize: false })
export class EncounterSettingsModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  modifiers: EncounterModifier[];

  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  differentials: EncounterDifferential[];

  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  specials: EncounterSpecial[];
}

export const EncounterSettingsSchema = SchemaFactory.createForClass(EncounterSettingsModel);
