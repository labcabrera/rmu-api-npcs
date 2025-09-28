import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import { NpcAttack } from './npc-attack.model';
import { NpcSkill } from './npc-skill.model';

export type NpcDocument = Npc & Document;

@Schema({ collection: 'npcs', _id: false, versionKey: false })
export class NpcModel {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  realmId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  level: number;

  @Prop({ type: [NpcSkill], required: true })
  skills: NpcSkill[];

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
