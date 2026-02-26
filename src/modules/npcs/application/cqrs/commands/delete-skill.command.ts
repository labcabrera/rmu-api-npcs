export class DeleteSkillCommand {
  constructor(
    readonly npcId: string,
    readonly skillId: string,
    readonly userId: string,
    readonly roles: string[],
  ) {}
}
