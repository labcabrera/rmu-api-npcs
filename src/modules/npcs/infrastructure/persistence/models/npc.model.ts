import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import type { NpcCategory } from '../../../domain/value-objects/npc-category.vo';
import type { NpcOutlookType } from '../../../domain/value-objects/npc-outlook-type.dto';
import { NpcAttack } from './npc-attack.model';
import { NpcItem } from './npc-item';
import { NpcSkill } from './npc-skill.model';

export type NpcDocument = Npc & Document;

@Schema({ collection: 'npcs', _id: false, versionKey: false })
export class NpcModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  realmId: string;

  @Prop({ type: String, required: true })
  category: NpcCategory;

  @Prop({ type: String, required: true })
  outlookType: NpcOutlookType;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  level: number;

  @Prop({ required: true })
  hp: number;

  @Prop({ required: true })
  db: number;

  @Prop({ required: true })
  at: number;

  @Prop({ required: true })
  initiative: number;

  @Prop({ type: [NpcSkill], required: true })
  skills: NpcSkill[];

  @Prop({ type: [NpcItem], required: true })
  items: NpcItem[];

  @Prop({ type: [NpcAttack], required: true })
  attacks: NpcAttack[];

  @Prop({ type: String, required: false })
  description: string | undefined;

  @Prop({ type: String, required: false })
  imageUrl: string | undefined;

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date | undefined;
}

export const NpcSchema = SchemaFactory.createForClass(NpcModel);
