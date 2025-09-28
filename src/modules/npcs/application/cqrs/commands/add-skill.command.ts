export class AddSkillCommand {
  constructor(
    public readonly id: string,
    public readonly skillName: string,
    public readonly level: number,
  ) {}
}
