import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsRepository } from './posts.repository';
import { VideoModule } from 'src/video/video.module';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostsRepository,
      CommentsRepository,
      AddressesRepository,
      PostsWatchedVideotimeRepository,
      PostsTimelineViewTimeRepository,
    ]),
    forwardRef(() => WalletsModule),
    forwardRef(() => WalletTransfersModule),
    VideoModule,
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
  exports: [PostsService]
})
export class PostsModule {}
