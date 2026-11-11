import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { NpcRepository } from '../../application/ports/npc-repository.port.js';
import { Npc } from '../../domain/aggregates/npc.aggregate.js';
import type { NpcProps } from '../../domain/aggregates/npc-props.js';
import { type NpcDocument, NpcModel } from '../persistence/models/npc.model.js';
import { MongoBaseRepository } from '../../../shared/infrastructure/db/mongo.base.repository.js';
import { RsqlParser } from '../../../shared/infrastructure/db/rsql-parser.js';

@Injectable()
export class MongoNpcRepository extends MongoBaseRepository<Npc, NpcModel> implements NpcRepository {
  constructor(@InjectModel(NpcModel.name) npcModel: Model<NpcModel>, rsqlParser: RsqlParser) {
    super(npcModel, rsqlParser);
  }

  async findByRealm(realmId: string): Promise<Npc[]> {
    const docs = await this.model.find({ realmId }).sort({ _id: 1 });
    return docs.map(doc => this.toEntity(doc));
  }

  protected mapToEntity(doc: NpcDocument): Npc {
    // A plain copy: the mixed blocks of the stat block must not keep Mongoose references.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, version: _version, ...props } = doc.toObject();
    return Npc.fromProps({ ...(props as Omit<NpcProps, 'id'>), id: _id });
  }
}
