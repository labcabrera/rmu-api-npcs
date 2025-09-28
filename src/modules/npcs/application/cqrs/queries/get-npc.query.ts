export class GetNpcQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
