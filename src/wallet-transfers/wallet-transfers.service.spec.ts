import { Test, TestingModule } from '@nestjs/testing';
import { WalletTransfersService } from './wallet-transfers.service';

describe('WalletTransfersService', () => {
  let service: WalletTransfersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletTransfersService],
    }).compile();

    service = module.get<WalletTransfersService>(WalletTransfersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
