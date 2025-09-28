import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors';
import type { NpcRepository } from '../../ports/npc.repository';
import { DeleteNpcCommand } from '../commands/delete-npc.command';

@CommandHandler(DeleteNpcCommand)
export class DeleteNpcHandler implements ICommandHandler<DeleteNpcCommand, void> {
  constructor(
    @Inject('NpcRepository') private readonly repo: NpcRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteNpcCommand): Promise<void> {
    const npc = await this.repo.findById(command.id);
    if (!npc) {
      throw new NotFoundError('NPC', command.id);
    }
    await this.repo.deleteById(command.id);
    //TODO propagate events
  }
}
