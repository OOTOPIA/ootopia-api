import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsRepository } from './wallets.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WalletsRepository]),],
  providers: [WalletsService],
  controllers: [WalletsController],
  exports: [WalletsService]
})
export class WalletsModule {}
