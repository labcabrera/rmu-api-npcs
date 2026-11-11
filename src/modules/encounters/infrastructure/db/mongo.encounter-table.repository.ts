import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { EncounterTableRepository } from '../../application/ports/encounter-table-repository.port.js';
import type { EncounterTable, EncounterTableSummary } from '../../domain/value-objects/encounter-table.vo.js';
import { EncounterTableModel } from '../persistence/models/encounter-table.model.js';

type StoredTable = Omit<EncounterTable, 'id'> & { _id: string };

/** A few dozen documents read whole: no index beyond _id. */
@Injectable()
export class MongoEncounterTableRepository implements EncounterTableRepository {
  constructor(@InjectModel(EncounterTableModel.name) private readonly model: Model<EncounterTableModel>) {}

  async findSummaries(): Promise<EncounterTableSummary[]> {
    const docs = await this.model
      .find({}, { biome: 1, kind: 1, roll: 1, 'subtables.min': 1, 'subtables.max': 1 })
      .sort({ kind: 1, _id: 1 })
      .lean<StoredTable[]>()
      .exec();
    return docs.map(doc => ({
      id: doc._id,
      biome: doc.biome ?? null,
      kind: doc.kind,
      roll: doc.roll,
      subtables: (doc.subtables ?? []).map(s => ({ min: s.min, max: s.max })),
    }));
  }

  async findAll(): Promise<EncounterTable[]> {
    const docs = await this.model.find().lean<StoredTable[]>().exec();
    return docs.map(toEntity);
  }

  async findById(id: string): Promise<EncounterTable | null> {
    const doc = await this.model.findById(id).lean<StoredTable>().exec();
    return doc ? toEntity(doc) : null;
  }
}

function toEntity(doc: StoredTable): EncounterTable {
  return {
    id: doc._id,
    biome: doc.biome ?? null,
    kind: doc.kind,
    roll: doc.roll,
    subtables: doc.subtables ?? [],
    source: doc.source ?? null,
  };
}
