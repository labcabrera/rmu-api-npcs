import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NpcAttack {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  attackTable: string;

  @Prop({ required: true })
  bo: number;

  @Prop({ required: true })
  fumble: number;
}
