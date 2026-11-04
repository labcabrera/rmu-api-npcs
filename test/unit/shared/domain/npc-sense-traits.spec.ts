import { normalizeTalentName, senseTraitId } from '../../../../src/modules/shared/domain/npc-sense-traits.js';

describe('normalizeTalentName', () => {
  it.each([
    ['Hearing: Cat', 'hearing cat'],
    ['Sight, eagle', 'sight eagle'],
    ['  Light-Sensitivity ', 'light sensitivity'],
    ['Missing Sense (Feel/Touch)', 'missing sense feel touch'],
    ['Visión  nocturna', 'vision nocturna'],
  ])('%s → %s', (name, expected) => expect(normalizeTalentName(name)).toBe(expected));
});

describe('senseTraitId', () => {
  it.each([
    ['Nightvision', 'nightvision'],
    ['Darkvision', 'darkvision'],
    ['Heatsense', 'heatsense'],
    ['Light sensitivity', 'light-sensitivity'],
    ['Light Sensitivity', 'light-sensitivity'],
    ['Acute hearing', 'acute-hearing'],
    ['Acute smell', 'acute-smell'],
    ['Acute taste', 'acute-taste'],
    ['Acute touch', 'acute-touch'],
    ['Acute vision', 'acute-vision'],
    ['Poor Vision', 'poor-vision'],
    ['Poor hearing', 'poor-hearing'],
    ['Poor smell', 'poor-smell'],
    ['Poor taste', 'poor-taste'],
    ['Poor touch', 'poor-touch'],
    ['Hearing: Cat', 'hearing-cat'],
    ['Hearing, Dog', 'hearing-dog'],
    ['Hearing: Hare', 'hearing-hare'],
    ['Sight, eagle', 'sight-eagle'],
    ['Sight, gecko', 'sight-gecko'],
    ['Sight, Hawk', 'sight-hawk'],
    ['Tetrachromatic Vision', 'tetrachromatic-vision'],
    ['Third eyelid', 'third-eyelid'],
    ['Extra Sense', 'extra-sense'],
    ['Extra sense: feel-like', 'extra-sense'],
    ['Extra sense: smell-like', 'extra-sense'],
    ['Missing sense: sight', 'missing-sense-vision'],
    ['Missing sense: smell', 'missing-sense-smell'],
    ['Missing sense: touch', 'missing-sense-touch'],
    ['Missing Sense (Feel/Touch)', 'missing-sense-touch'],
    ['Missing Sense (Hearing)', 'missing-sense-hearing'],
    ['missing-sense-taste', 'missing-sense-taste'],
  ])('%s → %s', (name, expected) => expect(senseTraitId(name)).toBe(expected));

  it.each([
    'Tremorsense',
    'Thermal vision',
    'Hearing, Echolocation',
    'Missing senses',
    'Natural Weapon',
    'Light-boned',
    '',
    null,
    undefined,
  ])('leaves %s unmapped', name => expect(senseTraitId(name)).toBeNull());
});
