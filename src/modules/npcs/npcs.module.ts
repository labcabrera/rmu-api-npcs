import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [
    TerminusModule,
    CqrsModule,
    ConfigModule,
    //MongooseModule.forFeature([{ name: GameModel.name, schema: GameSchema }]),
    AuthModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class NpcsModule {}
