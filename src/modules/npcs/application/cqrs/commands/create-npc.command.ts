import type { NpcCreationProps } from '../../../domain/aggregates/npc-props.js';

export class CreateNpcCommand {
  constructor(
    public readonly props: Omit<NpcCreationProps, 'owner'>,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
