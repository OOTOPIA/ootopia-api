import { FriendsService } from './friends.service';
import { forwardRef, Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestsRepository } from './repositories/friends.repository';
import { UsersModule } from 'src/users/users.module';
import { NotificationMessagesService } from 'src/notification-messages/notification-messages.service';
import { UsersDeviceTokenModule } from 'src/users-device-token/users-device-token.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FriendRequestsRepository
        ]),
        forwardRef(() => UsersModule),
        forwardRef(() => UsersDeviceTokenModule),
    ],
    providers: [FriendsService, NotificationMessagesService],
    controllers: [FriendsController],
})
export class FriendsModule { }
