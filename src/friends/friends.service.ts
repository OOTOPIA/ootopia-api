import { HttpException, Injectable } from '@nestjs/common';
import { FriendRequestsRepository } from './repositories/friends.repository';
import { NotificationMessagesService } from '../notification-messages/notification-messages.service';
import { UsersDeviceTokenService } from '../users-device-token/users-device-token.service';
import { FriendSearchParametersDto, FriendSearchServiceDto, NonFriendsLookupServiceDto, NonFriendsSearchParametersDto } from './dto/friends.dto';

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

    async searchFriendsByUser(filter: NonFriendsLookupServiceDto){
        let page: NonFriendsSearchParametersDto = {
            limit: +filter.limit,
            skip: +filter.limit * +filter.page,
            userId: filter.userId,
            name: filter.name || '',
            orderBy: filter.orderBy,
            sortingType: filter.sortingType,
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
        
        return this.friendRequestsRepository.searchFriends(page);
    }

    async isFriend(friendId: string, userId: string ){
        if (friendId == userId) {
            throw new HttpException(
                {
                  status: 404,
                  error: "User cannot be friends with himself",
                },
                404
            );
        }
        
        return { isFriend: !!(await this.friendRequestsRepository.isFriend(friendId, userId))};
    }
}
