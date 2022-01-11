import { Test, TestingModule } from '@nestjs/testing';
import { UsersDeviceTokenService } from './users-device-token.service';

describe('UsersDeviceTokenService', () => {
  let service: UsersDeviceTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersDeviceTokenService],
    }).compile();

    service = module.get<UsersDeviceTokenService>(UsersDeviceTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
