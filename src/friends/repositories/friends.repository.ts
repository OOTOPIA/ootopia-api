import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { FriendsCircle } from '../entities/friends.entity';
import * as camelcaseKeys from 'camelcase-keys';
import { FriendSearchParametersDto, NonFriendsSearchParametersDto } from "../dto/friends.dto";


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

    async searchFriends(filter: FriendSearchParametersDto) {
        let order = this.orderByQueryParams(filter);
        const [friends, total ] = await Promise.all([
            camelcaseKeys( 
                await this.query(`
                select
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
                left join addresses ua on ua.id = f.address_id
                left join cities c on c.id = ua.city_id
                where fc.user_id = $1 
                order by f.${order.orderBy} ${order.sortingType}
                offset $2 limit $3`, [filter.userId, filter.skip, filter.limit]
                )
            ),
            this.count({
                where: { userId: filter.userId}
            }),
        ])
        return {
            total,
            friends
        };
    }
    
    async searchNotFriendsByUser(filter: NonFriendsSearchParametersDto) {
        let order = this.orderByQueryParams(filter);
        return camelcaseKeys( 
            await this.query(`
            select
                array_to_json(
                    (
                        select ARRAY_AGG(
                            jsonb_build_object('thumbnailUrl',"thumbs".thumbnail_url, 'type',"thumbs"."type")
                        )
                        from (
                            select "type",thumbnail_url 
                            from posts pt where pt.user_id = u.id  and pt.deleted_at is null order by pt.created_at desc limit 5
                        )
                    as "thumbs")
                ) as "friendsThumbs",
                u.id,
                u.fullname,
                u.photo_url,
                u.created_at ,
                c.city , c.state , c.country
            from users u
            left join addresses a on a.id = u.address_id
            left join cities c on c.id = a.city_id
            where 
                not exists(select 1 from friends_circle fc where fc.user_id = $1 and fc.friend_id = u.id) and
                u.id != $1 and 
                (
                    u.fullname ilike($2) or
                    u.email ilike($2)
                )
            order by u.${order.orderBy} ${order.sortingType}
            offset $3 limit $4;`, [filter.userId, `%${filter.name}%`, filter.skip, filter.limit]
            )
        );
    }

    orderByQueryParams(filter) {
        let orderBy, sortingType;
        switch (filter.orderBy) {
            case 'name':
                orderBy = 'fullname'
                break;
            default:
                orderBy = 'created_at'
                break;
        }
        switch (filter.sortingType) {
            case 'asc':
                sortingType = 'asc';
                break;
            default:
                sortingType = 'desc';
                break;
        }
        return {
            orderBy,
            sortingType
        }
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