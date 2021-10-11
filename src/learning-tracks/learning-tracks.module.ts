import { forwardRef, Module } from '@nestjs/common';
import { LearningTracksService } from './learning-tracks.service';
import { LearningTracksController } from './learning-tracks.controller';
import { StrapiModule } from 'src/strapi/strapi.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningTracksRepository } from './learning-tracks.repository';
import { FilesUploadModule } from 'src/files-upload/files-upload.module';
import { VideoModule } from 'src/video/video.module';
import { PostsModule } from 'src/posts/posts.module';
import { GeneralConfigModule } from 'src/general-config/general-config.module';
import { LearningTrackCompletedChaptersRepository } from './repositories/learning-track-completed-chapters.repository';
import { WalletTransfersModule } from 'src/wallet-transfers/wallet-transfers.module';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningTracksRepository,
      LearningTrackCompletedChaptersRepository
    ]),
    StrapiModule,
    FilesUploadModule,
    VideoModule,
    GeneralConfigModule,
    forwardRef(() => PostsModule),
    forwardRef(() => WalletsModule),
    forwardRef(() => WalletTransfersModule),
  ],
  providers: [LearningTracksService],
  controllers: [LearningTracksController],
  exports: [LearningTracksService],
})
export class LearningTracksModule {}
