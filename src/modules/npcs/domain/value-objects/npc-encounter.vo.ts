import { NpcBiomeType } from './npc-biome.vo';

export class NpcEncounter {
  constructor(
    public spreadCode: string,
    public biomes: NpcBiomeType[],
  ) {}
}
