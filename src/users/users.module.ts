import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CitiesModule } from 'src/cities/cities.module';
import { FilesUploadModule } from 'src/files-upload/files-upload.module';
import { InterestsTagsModule } from 'src/interests-tags/interests-tags.module';
import { WalletTransfersModule } from 'src/wallet-transfers/wallet-transfers.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { AddressesRepository } from '../addresses/addresses.repository';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersRepository]),
    TypeOrmModule.forFeature([AddressesRepository]),
    forwardRef(() => AuthModule),
    FilesUploadModule,
    InterestsTagsModule,
    CitiesModule,
    WalletsModule,
    forwardRef(() => WalletTransfersModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
