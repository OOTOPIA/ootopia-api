import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsRepository } from './posts.repository';
import { VideoModule } from 'src/video/video.module';
import { FilesUploadModule } from 'src/files-upload/files-upload.module';
import { CommentsService } from './services/comments.service';
import { CommentsRepository } from './repositories/comments.repository';
import { AddressesRepository } from 'src/addresses/addresses.repository';
import { InterestsTagsModule } from 'src/interests-tags/interests-tags.module';
import { CitiesModule } from 'src/cities/cities.module';
import { GeneralConfigModule } from 'src/general-config/general-config.module';
import { WalletTransfersModule } from 'src/wallet-transfers/wallet-transfers.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { PostsWatchedVideotimeService } from './services/posts-watched-videotime.service';
import { PostsWatchedVideotimeRepository } from './repositories/posts-watched-videotime.repository';
import { PostsTimelineViewTimeRepository } from './repositories/posts-timeline-view-time.repository';
import { PostsTimelineViewTimeService } from './services/posts-timeline-view-time.service';
import { PostsUsersRewardedRepository } from './repositories/posts-users-rewarded.repository';
import { UsersRepository } from 'src/users/users.repository';
import { NotificationMessagesService } from 'src/notification-messages/notification-messages.service';
import { LinksService } from 'src/links/links.service';
import { UsersModule } from 'src/users/users.module';
import { SqsWorkerModule } from 'src/sqs-worker/sqs-worker.module';
import { UsersDeviceTokenModule } from 'src/users-device-token/users-device-token.module';
import { MediasRepository } from './media.repository';
import { InterestsTagsRepository } from '../interests-tags/repositories/interests-tags.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostsRepository,
      MediasRepository,
      CommentsRepository,
      UsersRepository,
      AddressesRepository,
      PostsWatchedVideotimeRepository,
      PostsTimelineViewTimeRepository,
      PostsUsersRewardedRepository,
      InterestsTagsRepository
    ]),
    forwardRef(() => WalletsModule),
    forwardRef(() => WalletTransfersModule),
    SqsWorkerModule,
    VideoModule,
    FilesUploadModule,
    InterestsTagsModule,
    CitiesModule,
    GeneralConfigModule,
    UsersModule,
    UsersDeviceTokenModule,
    HttpModule
  ],
  providers: [
    NotificationMessagesService,
    PostsService, 
    CommentsService,
    PostsWatchedVideotimeService, 
    PostsTimelineViewTimeService,
    LinksService
  ],
  controllers: [PostsController],
  exports: [PostsService, PostsWatchedVideotimeService, PostsTimelineViewTimeService, CommentsService, NotificationMessagesService]
})
export class PostsModule {}
