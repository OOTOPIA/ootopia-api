import { Test, TestingModule } from '@nestjs/testing';
import { UsersAppUsageTimeService } from './users-app-usage-time.service';

describe('UsersAppUsageTimeService', () => {
  let service: UsersAppUsageTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersAppUsageTimeService],
    }).compile();

    service = module.get<UsersAppUsageTimeService>(UsersAppUsageTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
