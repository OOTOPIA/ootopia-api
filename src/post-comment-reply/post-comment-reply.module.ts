import { Module } from '@nestjs/common';
import { PostCommentReplyService } from './post-comment-reply.service';
import { PostCommentReplyController } from './post-comment-reply.controller';
import { PostCommentReplyRepository } from './post-comment.reply.repository';

@Module({
  controllers: [PostCommentReplyController],
  providers: [PostCommentReplyService, PostCommentReplyRepository]
})
export class PostCommentReplyModule {}
