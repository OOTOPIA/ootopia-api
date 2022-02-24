import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { FriendsCircle } from '../entities/friends.entity';


@Injectable()
@EntityRepository(FriendsCircle)
export class FriendRequestsRepository extends Repository<FriendsCircle>{

    constructor() {
        super();
    }

    async addFriend(userId: string, friendId: string): Promise<FriendsCircle> {
        let friends = await this.findOne({
            where: {
                friendId,
                userId
            }
        })
        if(friends) throw new HttpException('user already friend', 404)
        let friendCicle = this.create({
            friendId,
            userId,
        })
        return await this.save(friendCicle)
    }

    async removeFriend(userId: string, friendId: string): Promise<void> {
        let friends = await this.findOne({
            where: {
                friendId,
                userId
            }
        })
        if(!friends) throw new HttpException('user not friend', 404)

        await this.createQueryBuilder()
                .delete()
                .from("friends_circle")
                .where(`user_id = (:userId) and
                        friend_id = (:friendId)
                        `,
                    { userId, friendId})
                .execute();
    }

    async searchFriends(userId: string): Promise<FriendsCircle[]> {
        return await this.find({
            where: {
                userId
            }
        })
    }
    

}