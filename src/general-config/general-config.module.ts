import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralConfigRepository } from './general-config.repository';
import { GeneralConfigService } from './general-config.service';
import { GeneralConfigController } from './general-config.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneralConfigRepository]),
  ],
  providers: [GeneralConfigService],
  controllers: [GeneralConfigController],
  exports: [GeneralConfigService],
})
export class GeneralConfigModule {}
