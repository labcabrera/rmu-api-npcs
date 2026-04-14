import { NpcAttack } from '../value-objects/npc-attack.vo';
import { NpcCategory } from '../value-objects/npc-category.vo';
import { NpcItem } from '../value-objects/npc-item.vo';
import { NpcOutlookType } from '../value-objects/npc-outlook-type.dto';
import { NpcSkill } from '../value-objects/npc-skill.vo';

export interface NpcProps {
  id: string;
  realmId: string;
  category: NpcCategory;
  outlookType: NpcOutlookType;
  name: string;
  level: number;
  hp: number;
  db: number;
  at: number;
  initiative: number;
  endurance: number;
  skills: NpcSkill[];
  items: NpcItem[];
  attacks: NpcAttack[];
  description: string | undefined;
  imageUrl: string | undefined;
  owner: string;
  createdAt: Date;
  updatedAt: Date | undefined;
}
