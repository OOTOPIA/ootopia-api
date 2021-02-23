import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsRepository } from './posts.repository';
import { VideoModule } from 'src/video/video.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostsRepository]), VideoModule],
  providers: [PostsService],
  controllers: [PostsController]
})
export class PostsModule {}
