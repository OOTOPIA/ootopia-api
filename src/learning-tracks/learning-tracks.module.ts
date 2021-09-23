import { Module } from '@nestjs/common';
import { LearningTracksService } from './learning-tracks.service';
import { LearningTracksController } from './learning-tracks.controller';

@Module({
  providers: [LearningTracksService],
  controllers: [LearningTracksController]
})
export class LearningTracksModule {}
