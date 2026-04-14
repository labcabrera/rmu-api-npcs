import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NpcAttack {
  @Prop({ required: true })
  attackName: string;

  @Prop({ required: true })
  attackType: string;

  @Prop({ required: true })
  attackTable: string;

  @Prop({ required: true })
  fumbleTable: string;

  @Prop({ required: true })
  attackSize: number;

  @Prop({ required: true })
  bo: number;

  @Prop({ required: true })
  fumble: number;
}
