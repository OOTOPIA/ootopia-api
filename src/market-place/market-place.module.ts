import { forwardRef, Module } from '@nestjs/common';
import { MarketPlaceService } from './market-place.service';
import { MarketPlaceController } from './market-place.controller';
import { StrapiModule } from 'src/strapi/strapi.module';
import { MarketPlaceRepository } from './market-place.repository';
import { FilesUploadModule } from 'src/files-upload/files-upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketPlaceRepository,
    ]),
    StrapiModule,
    FilesUploadModule,
  ],
  providers: [MarketPlaceService],
  controllers: [MarketPlaceController],
  exports: [ MarketPlaceService]
})
export class MarketPlaceModule {}
