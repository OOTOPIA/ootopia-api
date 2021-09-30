import { Module } from '@nestjs/common';
import { StrapiService } from './strapi.service';
import { LearningTracksService } from './learning-tracks/learning-tracks.service';

@Module({
  providers: [StrapiService, LearningTracksService],
  exports: [StrapiService],
})
export class StrapiModule {}
