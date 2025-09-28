import { CreateNpcCommand } from '../../../application/cqrs/commands/create-npc.command';

export class CreateNpcDto {
  static toCommand(dto: CreateNpcDto, userId: string, roles: string[]): CreateNpcCommand {
    throw new Error('Method not implemented.');
  }
}
