import { Module } from '@nestjs/common';
import { MarketPlaceService } from './market-place.service';
import { MarketPlaceController } from './market-place.controller';

@Module({
  controllers: [MarketPlaceController],
  providers: [MarketPlaceService]
})
export class MarketPlaceModule {}
