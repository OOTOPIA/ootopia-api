import { Test, TestingModule } from '@nestjs/testing';
import { AppleAppSiteAssociationService } from './apple-app-site-association.service';

describe('AppleAppSiteAssociationService', () => {
  let service: AppleAppSiteAssociationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppleAppSiteAssociationService],
    }).compile();

    service = module.get<AppleAppSiteAssociationService>(AppleAppSiteAssociationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
