import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsCodesService } from './invitations-codes.service';

describe('InvitationsCodesService', () => {
  let service: InvitationsCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitationsCodesService],
    }).compile();

    service = module.get<InvitationsCodesService>(InvitationsCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
