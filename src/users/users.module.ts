import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CitiesModule } from 'src/cities/cities.module';
import { FilesUploadModule } from 'src/files-upload/files-upload.module';
import { GeneralConfigModule } from 'src/general-config/general-config.module';
import { InterestsTagsModule } from 'src/interests-tags/interests-tags.module';
import { InvitationsCodesModule } from '../invitations-codes/invitations-codes.module';
import { PostsModule } from 'src/posts/posts.module';
import { WalletTransfersModule } from 'src/wallet-transfers/wallet-transfers.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { AddressesRepository } from '../addresses/addresses.repository';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersAppUsageTimeService } from './services/users-app-usage-time/users-app-usage-time.service';
import { UsersAppUsageTimeRepository } from './repositories/users-app-usage-time.repository';
import { SqsWorkerModule } from 'src/sqs-worker/sqs-worker.module';
import { BadgesModule } from 'src/badges/badges.module';
import { UsersTrophiesService } from './services/users-trophies/users-trophies.service';
import { UsersTrophiesRepository } from './repositories/users-trophies.repository';
import { LinksService } from 'src/links/links.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersRepository, UsersAppUsageTimeRepository]),
    TypeOrmModule.forFeature([AddressesRepository, UsersTrophiesRepository]),
    forwardRef(() => AuthModule),
    FilesUploadModule,
    InterestsTagsModule,
    CitiesModule,
    WalletsModule,
    BadgesModule,
    forwardRef(() => WalletTransfersModule),
    forwardRef(() => PostsModule),
    GeneralConfigModule,
    forwardRef(() => SqsWorkerModule),
    InvitationsCodesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersAppUsageTimeService, UsersTrophiesService, LinksService],
  exports: [UsersService, UsersAppUsageTimeService]
})
export class UsersModule {}
