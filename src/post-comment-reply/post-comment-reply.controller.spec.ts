import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentReplyController } from './post-comment-reply.controller';
import { PostCommentReplyService } from './post-comment-reply.service';

describe('PostCommentReplyController', () => {
  let controller: PostCommentReplyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCommentReplyController],
      providers: [PostCommentReplyService],
    }).compile();

    controller = module.get<PostCommentReplyController>(PostCommentReplyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
