import { HttpException, Injectable } from '@nestjs/common';
import { FriendRequestsRepository } from './repositories/friends.repository';
import { NotificationMessagesService } from '../notification-messages/notification-messages.service';
import { UsersDeviceTokenService } from '../users-device-token/users-device-token.service';
import { FriendsCircle } from './entities/friends.entity';
import { Users } from '../users/users.entity';
import { FriendPagingByUser, FriendRequestPagingByUser } from './dto/friends.dto';

@Injectable()
export class FriendsService {

    constructor(
        private readonly friendRequestsRepository: FriendRequestsRepository,
        private readonly notificationService: NotificationMessagesService,
        private readonly userDeviceToken: UsersDeviceTokenService
    ) { }

    async addFriend(userId: string, friendId: string) {
        let friend = this.friendRequestsRepository.addFriend(userId, friendId)

        let allTokensDevices = await this.userDeviceToken.getByUsersId(friendId);
        let messagesNotification = allTokensDevices.map(device => (
            {
                token: device.deviceToken,
                data: {
                    type: 'new-follower',
                }
            }
        ));
        if (messagesNotification.length) {
            await this.notificationService.sendFirebaseMessages(messagesNotification);
        }
        return friend;
    }
    async removeFriend(userId: string, friendId: string) {
        return this.friendRequestsRepository.removeFriend(userId, friendId)
    }

    async searchFriends(userId: string){
        return (await this.friendRequestsRepository.searchFriends(userId)).map(value => {
            delete value.updated_at
            delete value.friend_id
            delete value.user_id
            return value
        })
    }

    async searchFriendsByUser(userId: string, filter: FriendRequestPagingByUser){
        let page: FriendPagingByUser = {
            limit: filter.limit,
            skip: (filter.limit - 1)  * filter.page
        };
        page.limit = page.limit > 100 ? 100 : page.limit;
        if (page.skip < 0 || (page.skip == 0 && page.limit == 0)) {
            throw new HttpException(
                {
                  status: 404,
                  error: "Page not found",
                },
                404
              );
        }
        
        return this.friendRequestsRepository.searchFriendsByUserId(userId, page);
    }
}
