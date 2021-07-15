import { Test, TestingModule } from '@nestjs/testing';
import { SqsWorkerService } from './sqs-worker.service';

describe('SqsWorkerService', () => {
  let service: SqsWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SqsWorkerService],
    }).compile();

    service = module.get<SqsWorkerService>(SqsWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
