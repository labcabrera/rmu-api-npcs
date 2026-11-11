export class Realm {
  id: string;
  name: string;
}

/** What core says a user can do with a realm (specs 071 and 073). */
export type RealmAccessLevel = 'none' | 'read' | 'write' | 'manage';

/** One realm a user reads, with the level (spec 073). */
export interface RealmLevel {
  realmId: string;
  level: RealmAccessLevel;
}

export interface RealmPort {
  fetchRealmById(realmId: string): Promise<Realm | null>;
  /**
   * Every realm the user reads, with the level, as if the user were not an admin (spec 073): realms without access are
   * left out. A failure of core is an error, never an empty list.
   */
  fetchUserAccessMap(userId: string): Promise<RealmLevel[]>;
}

export const REALM_PORT = Symbol('RealmPort');
