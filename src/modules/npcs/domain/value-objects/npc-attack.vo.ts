export class NpcAttack {
  private constructor(
    public readonly name: string,
    public readonly attackTable: string,
    public readonly bo: number,
    public readonly fumble: number,
  ) {}
}
