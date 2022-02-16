import { Test, TestingModule } from '@nestjs/testing';
import { AppleAppSiteAssociationController } from './apple-app-site-association.controller';
import { AppleAppSiteAssociationService } from './apple-app-site-association.service';

describe('AppleAppSiteAssociationController', () => {
  let controller: AppleAppSiteAssociationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppleAppSiteAssociationController],
      providers: [AppleAppSiteAssociationService],
    }).compile();

    controller = module.get<AppleAppSiteAssociationController>(AppleAppSiteAssociationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
