import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NpcAttack {
  constructor(
    attackName: string,
    attackType: string,
    attackTable: string,
    fumbleTable: string,
    attackSize: number,
    bo: number,
    fumble: number,
  ) {
    this.attackName = attackName;
    this.attackType = attackType;
    this.attackTable = attackTable;
    this.fumbleTable = fumbleTable;
    this.attackSize = attackSize;
    this.bo = bo;
    this.fumble = fumble;
  }

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
