import type { CommandBus } from '@nestjs/cqrs';
import type { KafkaContext } from '@nestjs/microservices';
import { DeleteNpcsByRealmCommand } from '../../../src/modules/npcs/application/cqrs/commands/delete-npcs-by-realm.command.js';
import { KafkaRealmEventConsumer } from '../../../src/modules/npcs/interfaces/messaging/kafka.realm-event-consumer.js';

const TOPIC = 'internal.rmu-core.realm.deleted.v1';
const context = { getTopic: () => TOPIC } as unknown as KafkaContext;

const setup = (execute = vi.fn(() => Promise.resolve())) => {
  const consumer = new KafkaRealmEventConsumer({ execute } as unknown as CommandBus);
  const logger = (consumer as unknown as { logger: { error: (...args: unknown[]) => void; log: () => void } }).logger;
  const error = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
  vi.spyOn(logger, 'log').mockImplementation(() => undefined);
  return { consumer, execute, error };
};

describe('KafkaRealmEventConsumer', () => {
  it('runs the system command that deletes the NPCs of the realm', async () => {
    const { consumer, execute } = setup();
    await consumer.handleRealmDeleted({ data: { id: 'realm-a' } }, context);
    expect(execute).toHaveBeenCalledWith(new DeleteNpcsByRealmCommand('realm-a'));
  });

  it('logs a payload without realm id and runs nothing', async () => {
    const { consumer, execute, error } = setup();
    await consumer.handleRealmDeleted({}, context);
    expect(execute).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining(TOPIC));
  });

  it('logs a failing command with the realm id and the topic, without rethrowing', async () => {
    const { consumer, error } = setup(vi.fn(() => Promise.reject(new Error('mongo down'))));
    await expect(consumer.handleRealmDeleted({ data: { id: 'realm-a' } }, context)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/realm-a.*internal\.rmu-core\.realm\.deleted\.v1.*mongo down/),
      expect.any(String),
    );
  });
});
