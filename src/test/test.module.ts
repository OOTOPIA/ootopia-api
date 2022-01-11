import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { NotificationMessagesService } from 'src/notification-messages/notification-messages.service';

@Module({
  controllers: [TestController],
  providers: [TestService, NotificationMessagesService],
  
})
export class TestModule {}
