export class DeleteAttackCommand {
  constructor(
    public readonly npcId: string,
    public readonly attackName: string,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
