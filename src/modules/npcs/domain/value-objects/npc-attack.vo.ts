import type { AttackType } from './attack-type.vo';

export class NpcAttack {
  private constructor(
    public readonly attackName: string,
    public readonly attackType: AttackType,
    public readonly attackTable: string,
    public readonly fumbleTable: string,
    public readonly attackSize: number,
    public readonly bo: number,
    public readonly fumble: number,
  ) {}
}
