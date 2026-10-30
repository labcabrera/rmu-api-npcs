import type { NpcUpdateProps } from '../../../domain/aggregates/npc-props.js';

export class UpdateNpcCommand {
  constructor(
    public readonly id: string,
    public readonly props: NpcUpdateProps,
    public readonly userId: string,
    public readonly roles: string[],
    /** The version the client read; undefined applies the change to the current one. */
    public readonly expectedVersion?: number,
  ) {}
}
