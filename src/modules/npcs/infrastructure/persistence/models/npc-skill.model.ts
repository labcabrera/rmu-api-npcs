import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NpcSkill {
  constructor(skillId: string, bonus: number) {
    this.skillId = skillId;
    this.bonus = bonus;
  }

  @Prop({ required: true })
  skillId: string;

  @Prop({ required: true })
  bonus: number;
}
