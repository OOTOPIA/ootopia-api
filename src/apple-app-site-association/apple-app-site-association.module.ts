import { Module } from '@nestjs/common';
import { AppleAppSiteAssociationService } from './apple-app-site-association.service';
import { AppleAppSiteAssociationController } from './apple-app-site-association.controller';

@Module({
  controllers: [AppleAppSiteAssociationController],
  providers: [AppleAppSiteAssociationService]
})
export class AppleAppSiteAssociationModule {}
