import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { EncounterSettingsRepository } from '../../application/ports/encounter-settings-repository.port.js';
import type { EncounterSettings } from '../../domain/value-objects/encounter-table.vo.js';
import { EncounterSettingsModel } from '../persistence/models/encounter-settings.model.js';

type StoredSettings = Omit<EncounterSettings, 'id'> & { _id: string };

@Injectable()
export class MongoEncounterSettingsRepository implements EncounterSettingsRepository {
  constructor(@InjectModel(EncounterSettingsModel.name) private readonly model: Model<EncounterSettingsModel>) {}

  async findById(id: string): Promise<EncounterSettings | null> {
    const doc = await this.model.findById(id).lean<StoredSettings>().exec();
    if (!doc) return null;
    return { id: doc._id, modifiers: doc.modifiers ?? [], differentials: doc.differentials ?? [], specials: doc.specials ?? [] };
  }
}
