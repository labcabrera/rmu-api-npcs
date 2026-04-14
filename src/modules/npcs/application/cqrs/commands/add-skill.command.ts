import { AuthenticatedCommand } from '../../../../shared/application/cqrs/authenticated-command';

export class AddSkillCommand extends AuthenticatedCommand {
  constructor(
    public readonly npcId: string,
    public readonly skillId: string,
    public readonly ranks: number | undefined,
    public readonly bonus: number,
    userId: string,
    roles: string[],
  ) {
    super(userId, roles);
  }
}
