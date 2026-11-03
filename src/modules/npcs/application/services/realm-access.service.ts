import { Inject, Injectable } from '@nestjs/common';
import { RMU_ADMIN } from '../../../shared/domain/entities/user-roles.js';
import { type RealmAccessLevel, type RealmPort, REALM_PORT } from '../ports/realm.port.js';

/** How long the realms of a user are kept (spec 073, decision 6): a removed access shows here at most this late. */
export const REALM_ACCESS_TTL_MS = 30_000;

/** Above this number of cached users, the expired ones are dropped on the next fetch. */
const SWEEP_SIZE = 1_000;

type CacheEntry = { expiresAt: number; levels: Promise<ReadonlyMap<string, RealmAccessLevel>> };

/**
 * The level of a user on every realm, asked to core once per user and kept in memory for REALM_ACCESS_TTL_MS (spec
 * 073, decision 6). Concurrent requests of the same user share one call. A failure of core is not cached and reaches the
 * caller (502/504): the access is never opened by error. Admins never get here: they manage every NPC.
 */
@Injectable()
export class RealmAccessService {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(@Inject(REALM_PORT) private readonly realmPort: RealmPort) {}

  /** realmId → level of the realms the user reads; a realm that is not there is `none`. */
  levels(userId: string): Promise<ReadonlyMap<string, RealmAccessLevel>> {
    const now = Date.now();
    const cached = this.cache.get(userId);
    if (cached && cached.expiresAt > now) return cached.levels;
    if (this.cache.size >= SWEEP_SIZE) this.sweep(now);
    const levels = this.fetch(userId);
    const entry: CacheEntry = { expiresAt: now + REALM_ACCESS_TTL_MS, levels };
    this.cache.set(userId, entry);
    // Only this entry: a newer one of the same user may have replaced it meanwhile.
    levels.catch(() => {
      if (this.cache.get(userId) === entry) this.cache.delete(userId);
    });
    return levels;
  }

  /** The level of a user on a realm, `manage` for an admin without asking core. */
  async levelOf(realmId: string, userId: string, roles: readonly string[]): Promise<RealmAccessLevel> {
    if (roles.includes(RMU_ADMIN)) return 'manage';
    return (await this.levels(userId)).get(realmId) ?? 'none';
  }

  /** The ids of the realms the user reads. */
  async readableRealmIds(userId: string): Promise<string[]> {
    return [...(await this.levels(userId))].filter(([, level]) => level !== 'none').map(([realmId]) => realmId);
  }

  /** Forgets every cached user, so the next request asks core again. */
  clear(): void {
    this.cache.clear();
  }

  private async fetch(userId: string): Promise<ReadonlyMap<string, RealmAccessLevel>> {
    const entries = await this.realmPort.fetchUserAccessMap(userId);
    return new Map(entries.map(entry => [entry.realmId, entry.level]));
  }

  private sweep(now: number): void {
    for (const [userId, entry] of this.cache) {
      if (entry.expiresAt <= now) this.cache.delete(userId);
    }
  }
}
