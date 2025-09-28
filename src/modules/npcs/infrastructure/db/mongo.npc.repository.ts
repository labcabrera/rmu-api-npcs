import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import { Page } from '../../../shared/domain/entities/page.entity';
import { NotFoundError } from '../../../shared/domain/errors';
import { RsqlParser } from '../../../shared/infrastructure/messaging/rsql-parser';
import { NpcRepository } from '../../application/ports/npc.repository';
import { Npc } from '../../domain/aggregates/npc.aggregate';
import { NpcDocument, NpcModel } from '../persistence/models/npc.model';

@Injectable()
export class MongoNpcRepository implements NpcRepository {
  constructor(
    @InjectModel(NpcModel.name) private NpcModel: Model<NpcDocument>,
    private rsqlParser: RsqlParser,
  ) {}

  async findById(id: string): Promise<Npc | null> {
    const readed = await this.NpcModel.findById(id);
    return readed ? this.mapToEntity(readed) : null;
  }

  async findByRsql(rsql: string, page: number, size: number): Promise<Page<Npc>> {
    const skip = page * size;
    const mongoQuery = this.rsqlParser.parse(rsql);
    const [NpcsDocs, totalElements] = await Promise.all([
      this.NpcModel.find(mongoQuery).skip(skip).limit(size).sort({ name: 1 }),
      this.NpcModel.countDocuments(mongoQuery),
    ]);
    const content = NpcsDocs.map((doc) => this.mapToEntity(doc));
    return new Page<Npc>(content, page, size, totalElements);
  }

  async save(Npc: Partial<Npc>): Promise<Npc> {
    const model = new this.NpcModel({ ...Npc, _id: Npc.id });
    await model.save();
    return this.mapToEntity(model);
  }

  async update(id: string, request: Partial<Npc>): Promise<Npc> {
    const updatedNpc = await this.NpcModel.findByIdAndUpdate(id, { $set: request }, { new: true });
    if (!updatedNpc) {
      throw new NotFoundError('Npc', id);
    }
    return this.mapToEntity(updatedNpc);
  }

  async deleteById(id: string): Promise<Npc | null> {
    const result = await this.NpcModel.findByIdAndDelete(id);
    return result ? this.mapToEntity(result) : null;
  }

  async existsById(id: string): Promise<boolean> {
    const exists = await this.NpcModel.exists({ _id: id });
    return exists !== null;
  }

  private mapToEntity(doc: NpcDocument): Npc {
    return Npc.fromProps({
      id: doc.id as string,
      name: doc.name,
      skills: doc.skills,
      attacks: doc.attacks,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
