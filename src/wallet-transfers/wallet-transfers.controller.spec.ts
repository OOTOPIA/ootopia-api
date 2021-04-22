import { Test, TestingModule } from '@nestjs/testing';
import { WalletTransfersController } from './wallet-transfers.controller';

describe('WalletTransfersController', () => {
  let controller: WalletTransfersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletTransfersController],
    }).compile();

    controller = module.get<WalletTransfersController>(WalletTransfersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
