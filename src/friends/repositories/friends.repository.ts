import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { FriendsCircle } from '../entities/friends.entity';
import * as camelcaseKeys from 'camelcase-keys';


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
        if (friends) throw new HttpException('user already friend', 404)
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
        if (!friends) throw new HttpException('user not friend', 404)

        await this.createQueryBuilder()
            .delete()
            .from("friends_circle")
            .where(`user_id = (:userId) and
                        friend_id = (:friendId)
                        `,
                { userId, friendId })
            .execute();
    }

    async searchFriends(userId: string): Promise<QueryFriends[]> {
        let queryFriends: QueryFriends[] = camelcaseKeys(await this.query(`
        select fc.*,
        array_to_json(
            (
                select ARRAY_AGG(
                    jsonb_build_object('thumbnailUrl',"thumbs".thumbnail_url, 'type',"thumbs"."type")
                )
            from (
                select "type",thumbnail_url 
                from posts pt where pt.user_id = fc.friend_id order by pt.created_at desc limit 5
            ) as "thumbs")
        ) as "friendsThumbs",
        f.id,
        f.fullname,
        f.photo_url,
        c.city , c.state , c.country
        from friends_circle fc
        inner join users as f on f.id = fc.friend_id
        left join users_addresses ua on ua.id = f.address_id
        left join cities c on c.id = ua.city_id
        where fc.user_id = $1`, [userId]))
        return queryFriends
    }
}
type QueryFriends =  {
    id: string;
    friend_id: string;
    user_id: string;
    city: string;
    state: string;
    country: string;
    created_at: Date;
    updated_at: Date;
    friendsThumbs: {
        type: string;
        thumbnailUrl: string;
    }
    fullname: string;
    photo_url: string;
}