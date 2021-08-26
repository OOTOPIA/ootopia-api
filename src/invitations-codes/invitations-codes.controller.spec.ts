import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsCodesController } from './invitations-codes.controller';
import { InvitationsCodesService } from './invitations-codes.service';

describe('InvitationsCodesController', () => {
  let controller: InvitationsCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsCodesController],
      providers: [InvitationsCodesService],
    }).compile();

    controller = module.get<InvitationsCodesController>(InvitationsCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
