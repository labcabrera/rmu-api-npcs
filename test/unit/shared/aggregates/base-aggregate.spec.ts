import { Npc } from '../../../../src/modules/npcs/domain/aggregates/npc.aggregate.js';
import { npcProps } from '../../../support/npc-fixtures.js';

const props = () => npcProps();

describe('BaseAggregateRoot', () => {
  it('keeps the version out of the JSON of the aggregate [F-receta-27]', () => {
    const item = Npc.fromProps(props()).restoreVersion(3);
    expect(item.version).toBe(3);
    const json = JSON.parse(JSON.stringify(item)) as Record<string, unknown>;
    expect(Object.keys(json).some(key => key.toLowerCase().includes('version'))).toBe(false);
  });

  it('has changes when it was never stored', () => {
    expect(Npc.fromProps(props()).hasChanges()).toBe(true);
  });

  it('compares the state with the one it was loaded with, without updatedAt [F-receta-23]', () => {
    const item = Npc.fromProps(props()).restoreVersion(0);
    expect(item.hasChanges()).toBe(false);
    item.update({ description: 'A bear' });
    expect(item.updatedAt).not.toBeNull();
    expect(item.hasChanges()).toBe(false);
    item.update({ description: 'A big bear' });
    expect(item.hasChanges()).toBe(true);
  });

  it('takes a new snapshot when the version is restored after a write', () => {
    const item = Npc.fromProps(props()).restoreVersion(0);
    item.update({ description: 'Changed' });
    item.restoreVersion(1);
    expect(item.hasChanges()).toBe(false);
  });

  it('rejects a stale version', () => {
    const item = Npc.fromProps(props()).restoreVersion(2);
    expect(() => item.checkVersion(undefined)).not.toThrow();
    expect(() => item.checkVersion(2)).not.toThrow();
    expect(() => item.checkVersion(1)).toThrow(expect.objectContaining({ statusCode: 409, code: 'version-conflict' }) as Error);
  });
});
