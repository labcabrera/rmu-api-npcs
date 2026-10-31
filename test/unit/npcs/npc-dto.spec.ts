import { CreateNpcDto, toNpcProps } from '../../../src/modules/npcs/interfaces/http/dto/create-npc.dto.js';
import { UpdateNpcDto } from '../../../src/modules/npcs/interfaces/http/dto/update-npc.dto.js';
import { npcBody } from '../../support/npc-fixtures.js';

describe('NPC DTOs', () => {
  it('fills the defaults of a creation and never takes the source from the client', () => {
    const dto = Object.assign(new CreateNpcDto(), npcBody({ source: { book: 'x', key: 'y', page: 1 } }));
    const command = CreateNpcDto.toCommand(dto, 'u1', ['rmu-user']);
    expect(command.props).toMatchObject({
      accessType: 'private',
      type: null,
      criticalCodes: { reduceSeverity: false, immunities: [] },
      talents: [],
      items: [],
      source: null,
      realmId: 'e2e-realm',
    });
    expect(command.props.attacks[1]).toMatchObject({ attackTable: 'bite', alternativeTo: 0, fumbleTable: null, poison: null });
  });

  it('maps every block of the stat block', () => {
    const props = toNpcProps(
      npcBody({
        criticalCodes: { reduceSeverity: true, noKnockdown: true, stunImmune: false, bleedImmune: true, immunities: ['no-slash'] },
        running: { ranks: 6, bonus: 44 },
        shield: { type: 'normal', db: 20, ranks: 8, bonus: 60 },
        attacks: [
          { ob: 10, size: 3, attackTable: 'stinger', poison: { type: 'nerve', rrModifier: -20 }, hand: 'left', sequence: 'double' },
        ],
        resistances: { channeling: 1, essence: 2, mentalism: 3, physical: 4, fear: 5 },
        encounter: { group: 'Pack', biomes: ['A', 'Fw'] },
        stats: { ag: 1, co: 2, em: 3, in: 4, me: 5, pr: 6, qu: 7, re: 8, sd: 9, st: 10 },
        details: { height: '2 m' },
        talents: [{ name: 'Natural Weapon' }],
        items: [{ name: 'Torch', amount: 2 }],
      }) as unknown as Partial<CreateNpcDto>,
    );
    expect(props).toMatchObject({
      criticalCodes: { reduceSeverity: true, immunities: ['no-slash'] },
      running: { ranks: 6, bonus: 44 },
      shield: { type: 'normal', db: 20, ranks: 8, bonus: 60 },
      attacks: [{ poison: { type: 'nerve', rrModifier: -20 }, hand: 'left', sequence: 'double', kata: null }],
      resistances: { fear: 5 },
      encounter: { group: 'Pack', dice: null, biomes: ['A', 'Fw'], frequency: null },
      stats: { st: 10 },
      details: { height: '2 m', misc: null },
      talents: [{ name: 'Natural Weapon', tier: null, params: null, dp: null }],
      items: [{ name: 'Torch', itemTypeId: null, amount: 2 }],
    });
  });

  it('takes the DB of a shield from its type when the stat block does not give it (Table 9-6, ADR 0010)', () => {
    const shieldOf = (shield: Record<string, unknown>) => toNpcProps(npcBody({ shield }) as unknown as Partial<CreateNpcDto>).shield;
    expect(shieldOf({ type: 'target' })).toEqual({ type: 'target', db: 15, ranks: null, bonus: null });
    expect(shieldOf({ type: 'normal', db: null, ranks: 2, bonus: 30 })).toEqual({ type: 'normal', db: 20, ranks: 2, bonus: 30 });
    expect(shieldOf({ type: 'full', ranks: 0, bonus: 0 })).toMatchObject({ db: 25 });
    expect(shieldOf({ type: 'wall', db: 35 })).toMatchObject({ db: 35 });
  });

  it('leaves out the absent fields of a PATCH, clears the nullable ones and ignores null on the required ones', () => {
    const dto = Object.assign(new UpdateNpcDto(), { deathHits: null, name: null, attacks: null, level: 4, version: 2 });
    const command = UpdateNpcDto.toCommand('npc-1', dto, 'u1', ['rmu-user']);
    expect(command.props).toEqual({ deathHits: null, level: 4 });
    expect(command.expectedVersion).toBe(2);
  });
});
