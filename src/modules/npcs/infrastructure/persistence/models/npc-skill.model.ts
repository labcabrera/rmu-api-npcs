import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NpcSkill {
  @Prop({ required: true })
  skillId: string;

  @Prop({ required: true })
  bonus: number;
}
