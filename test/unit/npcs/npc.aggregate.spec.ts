import { Npc } from '../../../src/modules/npcs/domain/aggregates/npc.aggregate.js';
import type { NpcAttack } from '../../../src/modules/npcs/domain/value-objects/npc-stat-block.vo.js';
import { npcProps } from '../../support/npc-fixtures.js';

const attack = (extra: Partial<NpcAttack> = {}): NpcAttack => ({
  ob: 40,
  size: 6,
  attackTable: 'claw',
  fumbleTable: null,
  additionalCritical: null,
  sequence: null,
  cooperation: null,
  kata: null,
  alternativeTo: null,
  poison: null,
  hand: null,
  notation: null,
  ...extra,
});

const creation = (extra: Parameters<typeof npcProps>[0] = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, ...props } = npcProps(extra);
  return props;
};

describe('Npc', () => {
  it('creates an NPC with a new id and a created event', () => {
    const npc = Npc.create(creation());
    expect(npc.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(npc.updatedAt).toBeNull();
    expect(npc.getUncommittedEvents().map(e => e.eventType)).toEqual(['created']);
  });

  it.each([
    ['an empty name', { name: ' ' }, /Name is required/],
    ['a negative level', { level: -1 }, /Level/],
    ['no hits', { hp: 0 }, /Hits/],
    ['death hits below the hits', { hp: 80, deathHits: 40 }, /Death hits/],
    ['an unknown size', { size: 'colossal' as never }, /Invalid size colossal/],
    ['an attack of size 14', { attacks: [attack({ size: 14 })] }, /Invalid size of attack 1/],
    ['an alternative of itself', { attacks: [attack({ alternativeTo: 0 })] }, /alternative of a previous attack/],
    [
      'a duplicated skill',
      {
        skills: [
          { skillId: 'influence', specialization: 'intimidation', ranks: null, bonus: 1, note: null },
          { skillId: 'influence', specialization: 'intimidation', ranks: null, bonus: 2, note: null },
        ],
      },
      /Duplicated skill influence:intimidation/,
    ],
  ])('rejects %s', (_, extra, message) => {
    expect(() => Npc.create(creation(extra))).toThrow(message);
  });

  it('accepts the same skill with different specializations and an alternative of a previous attack', () => {
    const npc = Npc.create(
      creation({
        attacks: [attack(), attack({ attackTable: 'bite', alternativeTo: 0 })],
        skills: [
          { skillId: 'survival', specialization: 'forest', ranks: null, bonus: 10, note: null },
          { skillId: 'survival', specialization: 'plains', ranks: null, bonus: 10, note: null },
        ],
      }),
    );
    expect(npc.attacks).toHaveLength(2);
  });

  it('updates only the fields sent and validates the result', () => {
    const npc = Npc.fromProps(npcProps()).restoreVersion(0);
    npc.update({ level: 5, deathHits: undefined });
    expect(npc).toMatchObject({ level: 5, deathHits: 110, name: 'Bear' });
    expect(npc.getUncommittedEvents().map(e => e.eventType)).toEqual(['updated']);
    expect(() => npc.update({ hp: 200 })).toThrow(/Death hits/);
  });

  it('gives the old documents the defaults of the new fields', () => {
    const legacy = { ...npcProps(), accessType: undefined, size: undefined, movement: undefined, talents: undefined } as never;
    expect(Npc.fromProps(legacy)).toMatchObject({ accessType: 'private', size: 'medium', movement: [], talents: [] });
  });
});
