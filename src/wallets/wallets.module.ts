import { Module, forwardRef } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsRepository } from './wallets.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([WalletsRepository])],
  providers: [WalletsService],
  controllers: [WalletsController],
  exports: [WalletsService]
})
export class WalletsModule { }
