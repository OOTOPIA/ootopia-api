import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentRepliesController } from './post-comment-replies.controller';
import { PostCommentRepliesService } from './post-comment-replies.service';

describe('PostCommentRepliesController', () => {
  let controller: PostCommentRepliesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCommentRepliesController],
      providers: [PostCommentRepliesService],
    }).compile();

    controller = module.get<PostCommentRepliesController>(PostCommentRepliesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
