export class GetNpcQuery {
  constructor(
    public readonly npcId: string,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
