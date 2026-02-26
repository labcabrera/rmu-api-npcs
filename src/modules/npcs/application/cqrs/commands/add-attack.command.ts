import { AttackType } from '../../../domain/value-objects/attack-type.vo';

export class AddAttackCommand {
  constructor(
    public readonly npcId: string,
    public readonly attackName: string,
    public readonly attackType: AttackType,
    public readonly attackTable: string,
    public readonly fumbleTable: string,
    public readonly attackSize: number,
    public readonly bo: number,
    public readonly fumble: number,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
