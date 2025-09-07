import { Injectable } from '@nestjs/common';
import { Npc } from '../../domain/aggregates/npc.aggregate';
import { NpcRepository } from '../../domain/ports/npc.repository';
import { NpcMapper } from './npc.mapper';
import { NpcDoc, NpcModel } from './npc.schema';

@Injectable()
export class MongooseNpcRepository implements NpcRepository {
  async findById(id: string): Promise<Npc | null> {
    const doc = await NpcModel.findById(id).lean<NpcDoc | null>();
    return doc ? NpcMapper.toDomain(doc as any) : null;
  }

  async save(npc: Npc): Promise<void> {
    const toSave = NpcMapper.toPersistence(npc);
    await NpcModel.updateOne({ _id: npc.id }, { $set: toSave }, { upsert: true });
  }
}
