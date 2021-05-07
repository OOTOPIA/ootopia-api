import { Test, TestingModule } from '@nestjs/testing';
import { GeneralConfigController } from './general-config.controller';

describe('GeneralConfigController', () => {
  let controller: GeneralConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneralConfigController],
    }).compile();

    controller = module.get<GeneralConfigController>(GeneralConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
