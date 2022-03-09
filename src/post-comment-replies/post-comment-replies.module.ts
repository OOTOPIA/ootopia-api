import { Module } from '@nestjs/common';
import { PostCommentRepliesService } from './post-comment-replies.service';
import { PostCommentRepliesController } from './post-comment-replies.controller';
import { PostCommentRepliesRepository } from './post-comment-replies.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostCommentRepliesRepository])
  ],
  controllers: [PostCommentRepliesController],
  providers: [PostCommentRepliesService]
})
export class PostCommentRepliesModule {}
