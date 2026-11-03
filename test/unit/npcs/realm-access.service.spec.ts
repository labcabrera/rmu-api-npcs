import type { RealmLevel, RealmPort } from '../../../src/modules/npcs/application/ports/realm.port.js';
import { REALM_ACCESS_TTL_MS, RealmAccessService } from '../../../src/modules/npcs/application/services/realm-access.service.js';
import { BadGatewayError } from '../../../src/modules/shared/domain/errors/errors.js';

const LEVELS: RealmLevel[] = [
  { realmId: 'r-read', level: 'read' },
  { realmId: 'r-write', level: 'write' },
  { realmId: 'r-manage', level: 'manage' },
];

const setup = (fetch = vi.fn((userId: string) => Promise.resolve(userId ? LEVELS : []))) => {
  const port = { fetchRealmById: vi.fn(), fetchUserAccessMap: fetch } as unknown as RealmPort;
  return { service: new RealmAccessService(port), fetch };
};

describe('RealmAccessService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-03T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps the realms core answers to their levels', async () => {
    const { service, fetch } = setup();
    const levels = await service.levels('u1');
    expect([...levels]).toEqual([
      ['r-read', 'read'],
      ['r-write', 'write'],
      ['r-manage', 'manage'],
    ]);
    expect(fetch).toHaveBeenCalledWith('u1');
  });

  it('asks core once per user within the TTL, and again after it', async () => {
    const { service, fetch } = setup();
    await service.levels('u1');
    vi.advanceTimersByTime(REALM_ACCESS_TTL_MS - 1);
    await service.levels('u1');
    expect(fetch).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    await service.levels('u1');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('keeps one entry per user', async () => {
    const { service, fetch } = setup();
    await service.levels('u1');
    await service.levels('u2');
    await service.levels('u1');
    expect(fetch.mock.calls.map(call => call[0])).toEqual(['u1', 'u2']);
  });

  it('shares one call between concurrent requests of a user', async () => {
    const { service, fetch } = setup();
    await Promise.all([service.levels('u1'), service.levels('u1'), service.levels('u1')]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('propagates a failure of core and does not cache it', async () => {
    const fetch = vi
      .fn((userId: string) => Promise.resolve(userId ? LEVELS : []))
      .mockRejectedValueOnce(new BadGatewayError('rmu-api-core is not available'));
    const { service } = setup(fetch);
    await expect(service.levels('u1')).rejects.toMatchObject({ statusCode: 502 });
    await expect(service.levelOf('r-read', 'u1', ['rmu-user'])).resolves.toBe('read');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('answers manage for an admin without asking core', async () => {
    const { service, fetch } = setup();
    await expect(service.levelOf('any', 'admin', ['rmu-admin'])).resolves.toBe('manage');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('answers none for a realm core left out', async () => {
    const { service } = setup();
    await expect(service.levelOf('r-write', 'u1', ['rmu-user'])).resolves.toBe('write');
    await expect(service.levelOf('r-private', 'u1', ['rmu-user'])).resolves.toBe('none');
  });

  it('lists the readable realm ids, never a none one', async () => {
    const { service } = setup(vi.fn(() => Promise.resolve([...LEVELS, { realmId: 'r-none', level: 'none' as const }])));
    await expect(service.readableRealmIds('u1')).resolves.toEqual(['r-read', 'r-write', 'r-manage']);
  });

  it('asks again after clear', async () => {
    const { service, fetch } = setup();
    await service.levels('u1');
    service.clear();
    await service.levels('u1');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('drops expired users once the cache is large', async () => {
    const { service } = setup();
    for (let i = 0; i < 1_000; i++) await service.levels(`u${i}`);
    vi.advanceTimersByTime(REALM_ACCESS_TTL_MS);
    await service.levels('fresh');
    expect((service as unknown as { cache: Map<string, unknown> }).cache.size).toBe(1);
  });
});
