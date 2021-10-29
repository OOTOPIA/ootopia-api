import { forwardRef, Module } from '@nestjs/common';
import { MarketPlaceService } from './market-place.service';
import { MarketPlaceProductsController } from './market-place.controller';
import { StrapiModule } from 'src/strapi/strapi.module';
import { MarketPlaceRepository } from './market-place.repository';
import { FilesUploadModule } from 'src/files-upload/files-upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransfersModule } from 'src/wallet-transfers/wallet-transfers.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketPlaceRepository,
    ]),
    StrapiModule,
    FilesUploadModule,
    forwardRef(() => UsersModule),
    forwardRef(() => WalletsModule),
    forwardRef(() => WalletTransfersModule),
  ],
  providers: [MarketPlaceService],
  controllers: [MarketPlaceProductsController],
  exports: [ MarketPlaceService]
})
export class MarketPlaceModule {}
