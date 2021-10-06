import { forwardRef, Module } from '@nestjs/common';
import { LearningTracksService } from './learning-tracks.service';
import { LearningTracksController } from './learning-tracks.controller';
import { StrapiModule } from 'src/strapi/strapi.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningTracksRepository } from './learning-tracks.repository';
import { FilesUploadModule } from 'src/files-upload/files-upload.module';
import { VideoModule } from 'src/video/video.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningTracksRepository,
    ]),
    StrapiModule,
    FilesUploadModule,
    VideoModule,
    forwardRef(() => PostsModule),
  ],
  providers: [LearningTracksService],
  controllers: [LearningTracksController],
  exports: [LearningTracksService],
})
export class LearningTracksModule {}
