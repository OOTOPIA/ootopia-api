import { FriendsService } from './friends.service';
import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestsRepository } from './repositories/friends.repository';
import { NotificationMessagesService } from '../notification-messages/notification-messages.service';
import { UsersDeviceTokenModule } from '../users-device-token/users-device-token.module';

@Module({
    imports: [TypeOrmModule.forFeature([FriendRequestsRepository]), UsersDeviceTokenModule],
    providers: [FriendsService, NotificationMessagesService],
    controllers: [FriendsController],
})
export class FriendsModule { }
