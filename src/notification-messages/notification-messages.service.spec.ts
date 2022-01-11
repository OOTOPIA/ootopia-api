import { Test, TestingModule } from '@nestjs/testing';
import { NotificationMessagesService } from './notification-messages.service';

describe('NotificationMessagesService', () => {
  let service: NotificationMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationMessagesService],
    }).compile();

    service = module.get<NotificationMessagesService>(NotificationMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
