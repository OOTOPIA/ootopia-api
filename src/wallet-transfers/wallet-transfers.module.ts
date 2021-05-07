import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransfersRepository } from './wallet-transfers.repository';
import { WalletTransfersService } from './wallet-transfers.service';
import { WalletTransfersController } from './wallet-transfers.controller';
import { WalletsModule } from 'src/wallets/wallets.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletTransfersRepository]),
    WalletsModule,
    PostsModule
  ],
  providers: [WalletTransfersService],
  controllers: [WalletTransfersController],
  exports: [WalletTransfersService]
})
export class WalletTransfersModule {}
