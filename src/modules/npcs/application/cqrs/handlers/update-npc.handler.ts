import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Npc } from '../../../domain/aggregates/npc.aggregate';
import type { NpcRepository } from '../../ports/npc.repository';
import { UpdateNpcCommand } from '../commands/update-npc.command';

@CommandHandler(UpdateNpcCommand)
export class UpdateNpcHandler implements ICommandHandler<UpdateNpcCommand, Npc> {
  constructor(
    @Inject('NpcRepository') private readonly repo: NpcRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateNpcCommand): Promise<Npc> {
    const npc = await this.repo.findById(command.id);
    if (!npc) {
      throw new NotFoundError('NPC', command.id);
    }
    //TODO
    const saved = await this.repo.save(npc);
    //TODO propagate events
    return saved;
  }
}
