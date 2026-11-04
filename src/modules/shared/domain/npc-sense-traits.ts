/**
 * Sense talents of the creatures mapped to talent ids of the core catalog (spec 076, decision C7), so tactical can
 * treat them as actor traits. Only names, never rule text: the effect of each trait lives in tactical.
 *
 * The keys are normalized names (see {@link normalizeTalentName}); they cover the catalog spelling and the
 * spellings of the stat blocks ("Hearing: Cat", "Sight, eagle", "Missing sense: sight"…). Senses without a catalog
 * talent (Tremorsense, Thermal vision, Echolocation…) and lists of senses ("Missing senses") stay unmapped.
 */
const SENSE_TRAIT_IDS: Readonly<Record<string, string>> = {
  nightvision: 'nightvision',
  'night vision': 'nightvision',
  darkvision: 'darkvision',
  'dark vision': 'darkvision',
  heatsense: 'heatsense',
  'heat sense': 'heatsense',
  'light sensitivity': 'light-sensitivity',
  'acute hearing': 'acute-hearing',
  'acute smell': 'acute-smell',
  'acute taste': 'acute-taste',
  'acute touch': 'acute-touch',
  'acute vision': 'acute-vision',
  'poor hearing': 'poor-hearing',
  'poor smell': 'poor-smell',
  'poor taste': 'poor-taste',
  'poor touch': 'poor-touch',
  'poor vision': 'poor-vision',
  'hearing cat': 'hearing-cat',
  'hearing dog': 'hearing-dog',
  'hearing hare': 'hearing-hare',
  'sight eagle': 'sight-eagle',
  'sight gecko': 'sight-gecko',
  'sight hawk': 'sight-hawk',
  'tetrachromatic vision': 'tetrachromatic-vision',
  'third eyelid': 'third-eyelid',
  'extra sense': 'extra-sense',
  'missing sense hearing': 'missing-sense-hearing',
  'missing sense smell': 'missing-sense-smell',
  'missing sense taste': 'missing-sense-taste',
  'missing sense touch': 'missing-sense-touch',
  'missing sense feel': 'missing-sense-touch',
  'missing sense feel touch': 'missing-sense-touch',
  'missing sense vision': 'missing-sense-vision',
  'missing sense sight': 'missing-sense-vision',
};

/** Extra Sense carries the sense it imitates in the name ("Extra sense: smell-like"). */
const EXTRA_SENSE_PREFIX = 'extra sense ';

/** Lowercase, without accents or punctuation, and with single spaces: "Hearing: Cat" → "hearing cat". */
export function normalizeTalentName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** The catalog talent id of a sense talent, or null when the name is not a known sense. */
export function senseTraitId(name: string | null | undefined): string | null {
  if (!name) return null;
  const normalized = normalizeTalentName(name);
  const id = SENSE_TRAIT_IDS[normalized];
  if (id) return id;
  return normalized.startsWith(EXTRA_SENSE_PREFIX) ? 'extra-sense' : null;
}
