import { Test, TestingModule } from '@nestjs/testing';
import { UsersDeviceTokenController } from './users-device-token.controller';
import { UsersDeviceTokenService } from './users-device-token.service';

describe('UsersDeviceTokenController', () => {
  let controller: UsersDeviceTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersDeviceTokenController],
      providers: [UsersDeviceTokenService],
    }).compile();

    controller = module.get<UsersDeviceTokenController>(UsersDeviceTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
