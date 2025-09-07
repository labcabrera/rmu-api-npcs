export class Attack {
  private constructor(
    public readonly name: string,
    public readonly damage: number,
    public readonly cooldownMs: number,
  ) {}
  static create(props: { name: string; damage: number; cooldownMs: number }) {
    const name = props.name?.trim();
    const damage = Number(props.damage);
    const cooldownMs = Number(props.cooldownMs);
    if (!name) throw new Error('Attack.name is required');
    if (!(damage > 0)) throw new Error('Attack.damage must be > 0');
    if (!(cooldownMs >= 0)) throw new Error('Attack.cooldownMs must be >= 0');
    return new Attack(name, damage, cooldownMs);
  }
  equals(other: Attack) {
    return this.name.toLowerCase() === other.name.toLowerCase();
  }
}
