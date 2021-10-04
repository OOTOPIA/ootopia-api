import { Test, TestingModule } from '@nestjs/testing';
import { MarketPlaceService } from './market-place.service';

describe('MarketPlaceService', () => {
  let service: MarketPlaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketPlaceService],
    }).compile();

    service = module.get<MarketPlaceService>(MarketPlaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
