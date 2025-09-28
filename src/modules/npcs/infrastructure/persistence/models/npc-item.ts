import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NpcItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  itemTypeId: number;

  @Prop({ required: true })
  stackeable: boolean;

  @Prop({ required: true })
  amount: number;
}
