import { Test, TestingModule } from '@nestjs/testing';
import { DailyGoalDistributionHandlerService } from './daily-goal-distribution-handler.service';

describe('DailyGoalDistributionHandlerService', () => {
  let service: DailyGoalDistributionHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyGoalDistributionHandlerService],
    }).compile();

    service = module.get<DailyGoalDistributionHandlerService>(DailyGoalDistributionHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
