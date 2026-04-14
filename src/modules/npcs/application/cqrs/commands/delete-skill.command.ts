import { AuthenticatedCommand } from '../../../../shared/application/cqrs/authenticated-command';

export class DeleteSkillCommand extends AuthenticatedCommand {
  constructor(
    public readonly npcId: string,
    public readonly skillId: string,
    userId: string,
    roles: string[],
  ) {
    super(userId, roles);
  }
}
