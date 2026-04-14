import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NpcItem {
  constructor(name: string, itemTypeId: number, stackeable: boolean, amount: number) {
    this.name = name;
    this.itemTypeId = itemTypeId;
    this.stackeable = stackeable;
    this.amount = amount;
  }

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  itemTypeId: number;

  @Prop({ required: true })
  stackeable: boolean;

  @Prop({ required: true })
  amount: number;
}
