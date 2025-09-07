import { Npc } from '../../domain/aggregates/npc.aggregate';
import { Attack } from '../../domain/value-objects/attack.vo';
import { Skill } from '../../domain/value-objects/skill.vo';
import { NpcDoc } from './npc.schema';

export class NpcMapper {
  static toDomain(doc: NpcDoc): Npc {
    return (Npc as any).create({
      id: doc._id,
      name: doc.name,
      skills: doc.skills.map((s) => Skill.create(s)),
      attacks: doc.attacks.map((a) => Attack.create(a)),
    });
  }
  static toPersistence(npc: Npc): Partial<NpcDoc> {
    return {
      _id: npc.id,
      name: npc.name,
      skills: npc.skills.map((s) => ({ name: s.name, level: s.level })),
      attacks: npc.attacks.map((a) => ({ name: a.name, damage: a.damage, cooldownMs: a.cooldownMs })),
    };
  }
}
