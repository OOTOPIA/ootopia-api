import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsRepository } from './posts.repository';
import { VideoModule } from 'src/video/video.module';
import { CommentsService } from './services/comments.service';
import { CommentsRepository } from './repositories/comments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PostsRepository]), TypeOrmModule.forFeature([CommentsRepository]), VideoModule],
  providers: [PostsService, CommentsService],
  controllers: [PostsController]
})
export class PostsModule {}
