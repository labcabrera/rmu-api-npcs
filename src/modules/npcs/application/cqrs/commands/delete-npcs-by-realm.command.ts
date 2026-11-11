/**
 * Deletes the NPCs of a deleted realm (spec 073, decision 9). A system command: it comes from the realm.deleted event
 * of core, not from a request, so it has no user and does not go through the NPC guard.
 */
export class DeleteNpcsByRealmCommand {
  constructor(public readonly realmId: string) {}
}
