import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransfersRepository } from './wallet-transfers.repository';
import { WalletTransfersService } from './wallet-transfers.service';
import { WalletTransfersController } from './wallet-transfers.controller';
import { WalletsModule } from 'src/wallets/wallets.module';
import { PostsModule } from 'src/posts/posts.module';
import { UsersModule } from 'src/users/users.module';
import { GeneralConfigModule } from 'src/general-config/general-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletTransfersRepository,
    ]),
    forwardRef(() => PostsModule),
    WalletsModule,
    forwardRef(() => UsersModule),
    GeneralConfigModule,
  ],
  providers: [WalletTransfersService],
  controllers: [WalletTransfersController],
  exports: [WalletTransfersService]
})
export class WalletTransfersModule {}
