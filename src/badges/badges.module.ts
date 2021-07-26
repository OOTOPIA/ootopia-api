import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';

@Module({
  controllers: [BadgesController],
  providers: [BadgesService]
})
export class BadgesModule {}
