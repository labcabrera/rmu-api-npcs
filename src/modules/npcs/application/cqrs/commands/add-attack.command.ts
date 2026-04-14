import { AuthenticatedCommand } from '../../../../shared/application/cqrs/authenticated-command';
import { AttackType } from '../../../domain/value-objects/attack-type.vo';

export class AddAttackCommand extends AuthenticatedCommand {
  constructor(
    public readonly npcId: string,
    public readonly attackName: string,
    public readonly attackType: AttackType,
    public readonly attackTable: string,
    public readonly fumbleTable: string,
    public readonly attackSize: number,
    public readonly bo: number,
    public readonly fumble: number,
    userId: string,
    roles: string[],
  ) {
    super(userId, roles);
  }
}
