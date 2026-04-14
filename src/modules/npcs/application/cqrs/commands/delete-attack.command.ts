import { AuthenticatedCommand } from '../../../../shared/application/cqrs/authenticated-command';

export class DeleteAttackCommand extends AuthenticatedCommand {
  constructor(
    public readonly npcId: string,
    public readonly attackName: string,
    userId: string,
    roles: string[],
  ) {
    super(userId, roles);
  }
}
