import { Injectable } from '@nestjs/common';
import { MarketPlaceDto } from './dto/create-market-place.dto';

@Injectable()
export class MarketPlaceService {
  create(createMarketPlaceDto: MarketPlaceDto) {
    return 'This action adds a new marketPlace';
  }

  findAll() {
    return `This action returns all marketPlace`;
  }

  findOne(id: number) {
    return `This action returns a #${id} marketPlace`;
  }

  update(id: number, updateMarketPlaceDto: MarketPlaceDto) {
    return `This action updates a #${id} marketPlace`;
  }

  remove(id: number) {
    return `This action removes a #${id} marketPlace`;
  }
}
