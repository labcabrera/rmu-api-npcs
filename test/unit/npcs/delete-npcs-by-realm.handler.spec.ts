import { DeleteNpcsByRealmCommand } from '../../../src/modules/npcs/application/cqrs/commands/delete-npcs-by-realm.command.js';
import { DeleteNpcsByRealmHandler } from '../../../src/modules/npcs/application/cqrs/handlers/delete-npcs-by-realm.handler.js';
import type { NpcRepository } from '../../../src/modules/npcs/application/ports/npc-repository.port.js';
import { Npc } from '../../../src/modules/npcs/domain/aggregates/npc.aggregate.js';
import type { DomainEventPublisher } from '../../../src/modules/shared/application/ports/domain-event-publisher.port.js';
import { npcProps } from '../../support/npc-fixtures.js';

describe('DeleteNpcsByRealmHandler', () => {
  const setup = (npcs: Npc[], alreadyGone: string[] = []) => {
    const findByRealm = vi.fn(() => Promise.resolve(npcs));
    const deleteById = vi.fn((id: string) => Promise.resolve(alreadyGone.includes(id) ? null : npcs.find(n => n.id === id)!));
    const repository = { findByRealm, deleteById } as unknown as NpcRepository;
    const publish = vi.fn(() => Promise.resolve());
    const handler = new DeleteNpcsByRealmHandler(repository, { publish } as unknown as DomainEventPublisher);
    vi.spyOn((handler as unknown as { logger: { log: () => void } }).logger, 'log').mockImplementation(() => undefined);
    return { handler, findByRealm, deleteById, publish };
  };

  it('deletes every NPC of the realm and publishes one npc.deleted each', async () => {
    const npcs = [Npc.fromProps(npcProps({ id: 'a' })), Npc.fromProps(npcProps({ id: 'b' }))];
    const { handler, findByRealm, deleteById, publish } = setup(npcs);
    await handler.execute(new DeleteNpcsByRealmCommand('realm-1'));
    expect(findByRealm).toHaveBeenCalledWith('realm-1');
    expect(deleteById).toHaveBeenCalledTimes(2);
    expect(publish.mock.calls.map(call => (call as unknown[])[0])).toEqual(['npc', 'npc']);
  });

  it('publishes nothing for an NPC another delivery already deleted', async () => {
    const { handler, publish } = setup([Npc.fromProps(npcProps({ id: 'a' }))], ['a']);
    await handler.execute(new DeleteNpcsByRealmCommand('realm-1'));
    expect(publish).not.toHaveBeenCalled();
  });
});
