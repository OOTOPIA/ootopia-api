import { Test, TestingModule } from '@nestjs/testing';
import { StrapiService } from './strapi.service';

describe('StrapiService', () => {
  let service: StrapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StrapiService],
    }).compile();

    service = module.get<StrapiService>(StrapiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
