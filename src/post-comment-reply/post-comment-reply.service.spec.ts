import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentReplyService } from './post-comment-reply.service';

describe('PostCommentReplyService', () => {
  let service: PostCommentReplyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostCommentReplyService],
    }).compile();

    service = module.get<PostCommentReplyService>(PostCommentReplyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
