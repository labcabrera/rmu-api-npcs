export class Skill {
  private constructor(
    public readonly name: string,
    public readonly level: number,
  ) {}
  static create(props: { name: string; level: number }) {
    const name = props.name?.trim();
    const level = Number(props.level);
    if (!name) throw new Error('Skill.name is required');
    if (!Number.isInteger(level) || level < 1 || level > 100) {
      throw new Error('Skill.level must be an integer between 1 and 100');
    }
    return new Skill(name, level);
  }
  equals(other: Skill) {
    return this.name.toLowerCase() === other.name.toLowerCase();
  }
}
