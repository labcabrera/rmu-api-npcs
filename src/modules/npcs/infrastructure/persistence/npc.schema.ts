import { Document, model, Schema } from 'mongoose';

export interface NpcDoc extends Document {
  _id: string;
  name: string;
  skills: { name: string; level: number }[];
  attacks: { name: string; damage: number; cooldownMs: number }[];
}

export const NpcSchema = new Schema<NpcDoc>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    skills: [{ name: String, level: Number }],
    attacks: [{ name: String, damage: Number, cooldownMs: Number }],
  },
  { _id: false, versionKey: false },
);

export const NpcModel = model<NpcDoc>('npc', NpcSchema);
