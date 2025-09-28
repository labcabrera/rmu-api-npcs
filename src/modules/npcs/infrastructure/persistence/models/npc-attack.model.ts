import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NpcAttack {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  bonus: number;
}
