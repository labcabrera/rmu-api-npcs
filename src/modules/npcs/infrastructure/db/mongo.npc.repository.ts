import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import { MongoBaseRepository } from '../../../shared/infrastructure/db/mongo.base.repository';
import { RsqlParser } from '../../../shared/infrastructure/persistence/repositories/rsql-parser';
import { NpcRepository } from '../../application/ports/npc.repository';
import { Npc } from '../../domain/aggregates/npc.aggregate';
import { NpcDocument, NpcModel } from '../persistence/models/npc.model';

@Injectable()
export class MongoNpcRepository extends MongoBaseRepository<Npc, NpcDocument> implements NpcRepository {
  constructor(@InjectModel(NpcModel.name) model: Model<NpcDocument>, rsqlParser: RsqlParser) {
    super(model, rsqlParser);
  }

  protected mapToEntity(doc: NpcDocument): Npc {
    return Npc.fromProps({
      id: doc.id as string,
      realmId: doc.realmId,
      category: doc.category,
      outlookType: doc.outlookType,
      name: doc.name,
      level: doc.level,
      hp: doc.hp,
      db: doc.db,
      at: doc.at,
      initiative: doc.initiative,
      endurance: doc.endurance,
      skills: doc.skills,
      items: doc.items,
      attacks: doc.attacks,
      description: doc.description,
      imageUrl: doc.imageUrl,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
