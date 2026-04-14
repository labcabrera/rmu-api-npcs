export interface AttackTablePort {
  getAttackTables(): Promise<string[]>;
}
