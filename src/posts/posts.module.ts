import { forwardRef, Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostsRepository,
      CommentsRepository,
      AddressesRepository,
      PostsWatchedVideotimeRepository,
      PostsTimelineViewTimeRepository,
      PostsUsersRewardedRepository,
    ]),
    forwardRef(() => WalletsModule),
    forwardRef(() => WalletTransfersModule),
    VideoModule,
    FilesUploadModule,
    InterestsTagsModule,
    CitiesModule,
    GeneralConfigModule,
  ],
  providers: [
    PostsService, 
    CommentsService,
    PostsWatchedVideotimeService, 
    PostsTimelineViewTimeService,
  ],
  controllers: [PostsController],
  exports: [PostsService, PostsWatchedVideotimeService, PostsTimelineViewTimeService]
})
export class PostsModule {}
