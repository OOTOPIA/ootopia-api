import { Test, TestingModule } from '@nestjs/testing';
import { MarketPlaceController } from './market-place.controller';
import { MarketPlaceService } from './market-place.service';

describe('MarketPlaceController', () => {
  let controller: MarketPlaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketPlaceController],
      providers: [MarketPlaceService],
    }).compile();

    controller = module.get<MarketPlaceController>(MarketPlaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
