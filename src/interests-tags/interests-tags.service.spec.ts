import { Test, TestingModule } from '@nestjs/testing';
import { InterestsTagsService } from './interests-tags.service';

describe('TagsService', () => {
  let service: InterestsTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterestsTagsService],
    }).compile();

    service = module.get<InterestsTagsService>(InterestsTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
