import { Module } from '@nestjs/common';
import { VideoService } from './video.service';

@Module({
  providers: [VideoService],
  exports: [VideoService]
})
export class VideoModule {}
