import { Test, TestingModule } from '@nestjs/testing';
import { InterestsTagsController } from './interests-tags.controller';

describe('TagsController', () => {
  let controller: InterestsTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterestsTagsController],
    }).compile();

    controller = module.get<InterestsTagsController>(InterestsTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
