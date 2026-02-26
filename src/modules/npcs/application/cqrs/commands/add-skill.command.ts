export class AddSkillCommand {
  constructor(
    readonly npcId: string,
    readonly skillId: string,
    readonly ranks: number | undefined,
    readonly bonus: number,
    readonly userId: string,
    readonly roles: string[],
  ) {}
}
