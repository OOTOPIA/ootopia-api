import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, IsNull } from "typeorm";
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

    async isFriend(friendId, userId) {
        return this.findOne({
            where: {
                userId: userId,
                friendId: friendId
            }
        })
    }
    async alreadyFriends (filter: NonFriendsSearchParametersDto) {
        let order = this.orderByQueryParams(filter);
        return (await this.query(`
        select 
        array_to_json(
            (
                select ARRAY_AGG(
                    jsonb_build_object('thumbnailUrl',"thumbs".thumbnail_url, 'type',"thumbs"."type")
                )
                from (
                    select "type",
                    (
                        CASE 
                            when thumbnail_url is not null
                            then thumbnail_url
                            else (select m.thumbnail_url from medias m where m.id = any(pt.media_ids) limit 1 )
                        end
                    ) as "thumbnail_url"
                    from posts pt where pt.user_id = u.id  and pt.deleted_at is null order by pt.created_at desc limit 5
                )
            as "thumbs")
        ) as "friendsThumbs",
        u.id,
        u.fullname,
        u.photo_url,
        c.city, 
        c.state, 
        c.country
        from friends_circle fc 
        inner join users u on fc.friend_id = u.id and u.banned_at is null
        left join addresses a on a.id = u.address_id
        left join cities c on c.id = a.city_id
        where 
        fc.user_id = $1 and 
        (
            u.fullname ilike($2) or
            u.email = $3
        )
        order by u.${order.orderBy} ${order.sortingType}`, [filter.userId, `%${filter.name}%`, filter.name])
        )
    } 
    

    async totalFriends (filter: NonFriendsSearchParametersDto) {
        return (await this.query(`
        select count(*)::int from users u
        where 
        u.id != $1 and u.banned_at is null and 
        (
            u.fullname ilike($2) or
            u.email = $3
        )`, [filter.userId, `%${filter.name}%`, filter.name]
        ))[0].count
    }
    
    async searchFriends(filter: NonFriendsSearchParametersDto) {
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
                            select "type",
                            (
                                CASE 
                                    when thumbnail_url is not null
                                    then thumbnail_url
                                    else (select m.thumbnail_url from medias m where m.id = any(pt.media_ids) limit 1 )
                                end
                            ) as "thumbnail_url" 
                            from posts pt where pt.user_id = u.id  and pt.deleted_at is null order by pt.created_at desc limit 5
                        )
                    as "thumbs")
                ) as "friendsThumbs",
                u.id,
                u.fullname,
                u.photo_url,
                u.created_at,
                c.city, 
                c.state, 
                c.country
                from users u
                left join addresses a on a.id = u.address_id
                left join cities c on c.id = a.city_id
                where 
                    u.id != $1 and u.banned_at is null and
                    (
                        u.fullname ilike($2) or
                        u.email = $5
                    ) and 
                    u.id not in(
                        select 
                        fc.friend_id
                        from friends_circle fc
                        inner join users fu on fc.friend_id = fu.id
                        where
                        fc.user_id = $1
                         )
                order by u.${order.orderBy} ${order.sortingType}
                offset $3 limit $4;`, [filter.userId, `%${filter.name}%`, filter.skip, filter.limit, filter.name]
            )
        )
    };

    async friendsByUser(filter: FriendSearchParametersDto) {
        let order = this.orderByQueryParams(filter);
        let params = [filter.userId, filter.skip, filter.limit];
        let where = '';

        if (filter.friendId) {
            params.push(filter.friendId);
            where = ' EXISTS(select 1 from friends_circle fc where fc.user_id = $4 and fc.friend_id = f.id) as "is_friend", '
        }
        
        order.orderBy = order.orderBy == 'fullname' ? 'f.fullname' : 'fc.created_at';
        const [friends, total] = await Promise.all([
            camelcaseKeys( 
                await this.query(`
                select
                array_to_json(
                    (
                        select ARRAY_AGG(
                            jsonb_build_object('thumbnailUrl',"thumbs".thumbnail_url, 'type',"thumbs"."type")
                        )
                    from (
                        select "type",
                        (
                            CASE 
                                when thumbnail_url is not null
                                then thumbnail_url
                                else (select m.thumbnail_url from medias m where m.id = any(pt.media_ids) limit 1 ) 
                            end 
                        ) as "thumbnail_url" 
                        from posts pt where pt.user_id = fc.friend_id and pt.deleted_at is null order by pt.created_at desc limit 5
                    ) as "thumbs")
                ) as "friendsThumbs",
                f.id,
                f.fullname,
                f.photo_url,
                ${where}
                c.city , c.state , c.country
                from friends_circle fc
                inner join users as f on f.id = fc.friend_id and f.banned_at is null
                left join addresses ua on ua.id = f.address_id
                left join cities c on c.id = ua.city_id
                where fc.user_id = $1 
                order by ${order.orderBy} ${order.sortingType}
                offset $2 limit $3`, params
                )
            ),
            await this.query(`
            select count(*)::int from friends_circle fc
            inner join users as f on f.id = fc.friend_id and f.banned_at is null
            where 
            fc.user_id = $1`, [filter.userId]
            ),
            
        ])
        return {
            friends,
            total: total[0].count
        };
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