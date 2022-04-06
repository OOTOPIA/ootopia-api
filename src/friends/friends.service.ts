import { HttpException, Injectable } from '@nestjs/common';
import { FriendRequestsRepository } from './repositories/friends.repository';
import { NotificationMessagesService } from '../notification-messages/notification-messages.service';
import { UsersDeviceTokenService } from '../users-device-token/users-device-token.service';
import { FriendSearchByUserServiceDto, FriendSearchParametersDto, FriendSearchServiceDto, NonFriendsLookupServiceDto, NonFriendsSearchParametersDto } from './dto/friends.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FriendsService {

    constructor(
        private readonly friendRequestsRepository: FriendRequestsRepository,
        private readonly notificationService: NotificationMessagesService,
        private readonly userDeviceToken: UsersDeviceTokenService,
        private readonly usersService: UsersService,
    ) { }

    async addFriend(userId: string, friendId: string) {
        let friend = this.friendRequestsRepository.addFriend(userId, friendId)
        let user = await this.usersService.getUserById(userId);
        let allTokensDevices = await this.userDeviceToken.getByUsersId(friendId);
        let messagesNotification = allTokensDevices.map(device => (
            {
                token: device.deviceToken,
                data: {
                    type: 'new-follower',
                    photoUrl: user.photoUrl || '',
                    usersName: <any>JSON.stringify([user.fullname]),
                    userId: user.id,
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
        let searchFriends = await this.friendRequestsRepository.searchFriends(page);
        let alreadyFriends = await this.friendRequestsRepository.alreadyFriends(page);
        let totalFriends = await this.friendRequestsRepository.totalFriends(page);
        
        return {
            searchFriends, alreadyFriends, total: totalFriends
        }
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

    friendsByfriends(filter: FriendSearchByUserServiceDto){
        let page: FriendSearchParametersDto = {
            limit: +filter.limit,
            skip: +filter.limit * +filter.page,
            userId: filter.userId,
            orderBy: filter.orderBy,
            sortingType: filter.sortingType,
            friendId: filter.friendId,
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

        return this.friendRequestsRepository.friendsByUser(page);
    }

    async friendsByUser(filter: FriendSearchServiceDto){
        let page: FriendSearchParametersDto = {
            limit: +filter.limit,
            skip: +filter.limit * +filter.page,
            userId: filter.userId,
            orderBy: filter.orderBy,
            sortingType: filter.sortingType,
            friendId: null,
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

        return this.friendRequestsRepository.friendsByUser(page);
    }
}
