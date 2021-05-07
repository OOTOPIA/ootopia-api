import { Test, TestingModule } from '@nestjs/testing';
import { GeneralConfigService } from './general-config.service';

describe('GeneralConfigService', () => {
  let service: GeneralConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneralConfigService],
    }).compile();

    service = module.get<GeneralConfigService>(GeneralConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
