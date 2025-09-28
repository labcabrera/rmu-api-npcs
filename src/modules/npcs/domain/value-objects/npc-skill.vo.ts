export class NpcSkill {
  constructor(
    public readonly skillId: string,
    public readonly ranks: number | undefined,
    public readonly bonus: number,
  ) {}
}
