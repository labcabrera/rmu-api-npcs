export class NpcItem {
  private constructor(
    public readonly name: string,
    public readonly itemTypeId: string,
    public readonly stackeable: boolean,
    public readonly amount: number,
  ) {}
}
