import { Module } from '@nestjs/common';
import { LearningTracksService } from './learning-tracks.service';
import { LearningTracksController } from './learning-tracks.controller';
import { StrapiModule } from 'src/strapi/strapi.module';

@Module({
  imports: [
    StrapiModule,
  ],
  providers: [LearningTracksService],
  controllers: [LearningTracksController]
})
export class LearningTracksModule {}
