import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentRepliesService } from './post-comment-replies.service';

describe('PostCommentRepliesService', () => {
  let service: PostCommentRepliesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostCommentRepliesService],
    }).compile();

    service = module.get<PostCommentRepliesService>(PostCommentRepliesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
