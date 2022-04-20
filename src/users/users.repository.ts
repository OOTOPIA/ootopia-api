import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, ILike, Not, In } from 'typeorm';
import * as camelcaseKeys from 'camelcase-keys';
import { Users } from "./users.entity";
import { SuggestedFriendsRepositoryDto } from "./users.dto";

@Injectable()
@EntityRepository(Users)
export class UsersRepository extends Repository<Users>{

    constructor() {
        super();
    }

    async createOrUpdateUser(userData) {
        const user = this.create();
        if (userData.birthdate) {
            var birthdateSplit : any = userData.birthdate;
            birthdateSplit = birthdateSplit.split("/");
            var year = birthdateSplit[0].split(" ").join("");
            var month = birthdateSplit[1].split(" ").join("");
            var day = birthdateSplit[2].split(" ").join("");
            if (month.length < 2) {
                month = "0" + month;
            }
            if (day.length < 2) {
                day = "0" + day;
            }
            userData.birthdate = `${year}-${month}-${day}`;
        }
        Object.assign(user, userData);
        return await this.save(user);
    }

    async createUser(userData) {
        const user = this.create();
        Object.assign(user, userData);
        return user;
    }

    async deleteUser(id) {
        if (!id) {
            return null;
        }
        return this.delete(id);
    }

    async resetPassword(id: string, password: string) {
        let result = await getConnection()
        .createQueryBuilder()
        .update(Users)
        .set({ password })
        .where("id = :id", { id })
        .execute();
        if (result && result.affected){
            return { status: "ok" }
        }else{
            return null;
        }
    }

    async updateDailyGoalAchieved(id: string, dailyGoalAchieved: boolean) {
        let result = await getConnection()
        .createQueryBuilder()
        .update(Users)
        .set({ dailyGoalAchieved })
        .where("id = :id", { id })
        .execute();
        if (result && result.affected){
            return { status: "ok" }
        }else{
            return null;
        }
    }

    async getUserByEmail(email: string) {
        const user = await this.findOne({
          where: { email },
        });
        return user;
    }

    //I use the manual query because the typeOrm does not return related tables without the join, in this case, it would not return the address_id column
    async getUserById(id: string) {
        let results = camelcaseKeys(await getConnection().query(`
            SELECT 
                u.*, 
                array (
                    select 
                    json_build_object('Icon', b.icon, 'Name', b.name) as bdg
                    from user_badges
                    inner join badges b ON b.id = user_badges.badges_id
                    where user_badges.user_id = u.id
                ) as badges ,
                c.city,
                c.state,
                c.country
            FROM users u
            left join addresses a on a.id = u.address_id
            left join cities c on c.id = a.city_id
            WHERE u.id = $1
        `, [id]), { deep : true });

        let user = results.length ? results[0] : null;

        if (!user) return user;

        let trophies = await this.getUserTrophies(user.id);
        
        user.personalTrophyQuantity = trophies && trophies.personal ? +trophies.personal.quantity : 0;
        user.cityTrophyQuantity = trophies && trophies.city ? +trophies.city.quantity : 0;
        user.globalTrophyQuantity = trophies && trophies.global ? +trophies.global.quantity : 0;
        user.totalTrophyQuantity = trophies ? +trophies.total || 0 : 0;

        delete user.password;
        return user;
    }

    async getUserTrophies(userId: string) {
        let results : any[] = camelcaseKeys(await getConnection().query(`
            SELECT * FROM users_trophies WHERE user_id = $1
        `, [userId]), { deep : true });
        let trophies : any = results.length ? results : null;
        if (trophies) {
            let personalTrophy = results.filter((t) => t.trophyType == "personal");
            let cityTrophy = results.filter((t) => t.trophyType == "city");
            let globalTrophy = results.filter((t) => t.trophyType == "global");
            trophies = {
                "personal" : personalTrophy.length ? personalTrophy[0] : null,
                "city" : cityTrophy.length ? cityTrophy[0] : null,
                "global" : globalTrophy.length ? globalTrophy[0] : null,
                "total" : results.map((t) => +t.quantity).reduce((total, value) => total + value),
            };
        }
        return trophies;
    }

    async putDialogOpened(id : string, dialogType : string){
        let data : any = {};
        switch(dialogType) {
            case "personal":
                data.personalDialogOpened = true;
                break;
            case "city":
                data.cityDialogOpened = true;
                break;
            case "global":
                data.globalDialogOpened = true;
                break;
            default:
                throw new HttpException("Undefined type", 401);
        }
        
        let result = await getConnection()
        .createQueryBuilder()
        .update(Users)
        .set(data)
        .where("id = :id", { id })
        .execute();
        if (result && result.affected){
            return { status: "ok" }
        }else{
            return null;
        }

    }

    async usersList(skip: number, limit: number, fullname: string, excludedUsers: string[]) {
        return this.find({
            select: [ "id","email","fullname", "photoUrl"],
            where: { fullname: ILike(`%${fullname}%`) , ...(excludedUsers && {id: Not(In(excludedUsers))})},
            skip: skip,
            take: limit,
            order: {createdAt: "ASC"},
        });
    }

    async updateDontAskToConfirmGratitudeReward(id : string, value : boolean) {
        return getConnection()
            .createQueryBuilder()
            .update(Users)
            .set({ dontAskAgainToConfirmGratitudeReward : true })
            .where("id = :id", { id })
            .execute();
    }

    async retrieveSuggestedFriends(suggestedFriends: SuggestedFriendsRepositoryDto) {
        return camelcaseKeys(
            await getConnection().query(
                `select 
                ((select id from market_place_products mpp where mpp.user_id = u.id limit 1) is not null) as "isMarketPlace",
                ((select id from learning_tracks lt where lt.user_id = u.id limit 1) is not null) as "isLearningTracks",
                (concat(u.dial_code, replace(replace(u.phone, '-', ''),' ', '')) = any($3) is true)  as "hasNumberPhone",
                (u.email = any($2) is true)  as "hasEmail",
                CASE 
                    WHEN (u.id = any(
                            select "posts".id 
                            from (
                                select 
                                u.id, 
                                (
                                    select count(*) 
                                    from posts p 
                                    where p.user_id = u.id and 
                                    now() - INTERVAL '1 MONTH' >= p.created_at 
                                ) as "total_posts" 
                                from users u 
                                order by "total_posts" desc limit 5
                            ) as "posts"
                        ))
                    then (
                                    select count(*) 
                                    from posts p 
                                    where p.user_id = u.id and 
                                    now() - INTERVAL '1 MONTH' >= p.created_at 
                                ) 
                    else null 
                end "totalPosts",
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
                    u.id != $1 and 
                    (
                        (
                            ((select id from friends_circle fc where fc.friend_id = u.id and fc.id = $1) is not null and
                            (
                                (select id from market_place_products mpp where mpp.user_id = u.id limit 1) is null or
                                (select id from learning_tracks lt where lt.user_id = u.id limit 1) is not null) or
                                u.id = any(
                                    select "posts".id 
                                    from (
                                        select 
                                        u.id, 
                                        (
                                            select count(*) 
                                            from posts p 
                                            where p.user_id = u.id and 
                                            now() - INTERVAL '1 MONTH' >= p.created_at 
                                        ) as "total_posts" 
                                        from users u 
                                        order by "total_posts" desc limit 5
                                    ) as "posts"
                                )
                                or
                                (
                                    concat(u.dial_code, replace(replace(u.phone, '-', ''),' ', '')) = any($3)
                                )
                                or
                                (
                                    u.email = any($2)
                                )
                            )
                        ) or 
                        (select id from friends_circle fc where fc.friend_id = u.id and fc.id = $1) is null
                    ) order by "hasNumberPhone" desc, "hasEmail" desc, "totalPosts" desc nulls last , "isMarketPlace" desc, "isLearningTracks" limit $5 offset $4;`,
                [suggestedFriends.id, suggestedFriends.importedContactEmails, suggestedFriends.importedContactNumbers, suggestedFriends.offset, suggestedFriends.limit],
            )
        );

    }

    async friendsSuggestedProfile(suggestedFriends: SuggestedFriendsRepositoryDto) {
        return camelcaseKeys(
            await getConnection().query(
                `select 
                (concat(u.dial_code, replace(replace(u.phone, '-', ''),' ', '')) = any($3) is true or u.email = any($2) is true) as "isContact",
                (	
                    (
                        select pur.id
                        from posts_users_rewarded pur
                        inner join posts p on p.id = pur.post_id
                        where pur.user_id = $1 and p.user_id = u.id limit 1
                     ) is not null 
                ) as "sentOOzOfPosts",
                (     
                    ( -- posts that user received ooz
                        select pur.id
                        from posts_users_rewarded pur
                        inner join posts p on p.id = pur.post_id
                        where pur.user_id = u.id and p.user_id = $1 limit 1
                     ) is not null 
                ) as "recevedOOzOfPosts",
                (
                    (-- posts that user has commented on
                        select pc.id from posts_comments pc
                        inner join posts p on p.id = pc.post_id
                        where pc.user_id = u.id and p.user_id = $1 limit 1
                    ) is not null
                ) as "usersCommentedOnPosts",
                (
                    ( -- comments the user received on the post
                        select pc.id
                        from posts_comments pc
                        inner join posts p on p.id = pc.post_id
                        where pc.user_id = $1 and p.user_id = u.id limit 1
                    ) is not null
                ) as "commentsReceivedOnthePosts",
                (
                    ( -- five users with the most friends
                        select 
                            "usersWithMoreFriends".user_id
                        from (
                            select 
                                distinct user_id, 
                                count(*) as "totalFriends" 
                            from friends_circle fc 
                            where user_id = u.id
                            group by fc.user_id 
                            order by "totalFriends" desc
                            limit 5
                        ) "usersWithMoreFriends" 
                        where u.id = "usersWithMoreFriends".user_id
                    ) is not null
                ) as "usersWithMoreFriends",
                (
                    (-- five users with the most friends
                        select 
                            json_extract_path_text(cast(market_place_data AS json),'userId') as "userId"
                        from wallet_transfers wt 
                        where
                        json_extract_path_text(cast(market_place_data AS json),'userId') is not null and 
                        json_extract_path_text(cast(market_place_data AS json),'userId')::text != 'ootopia'::text and
                        json_extract_path_text(cast(market_place_data AS json),'userId')::text != $1::text and
                        wt.user_id = u.id and
                           wt."action" = 'sent' and
                           wt.processed is true and 
                           wt.removed is false and
                          wt.origin = 'market_place_transfer' limit 1
                    ) is not null
                ) as "usersWithMarketPlace",
                (
                    (-- owners of learning tracks the user watched
                    select distinct lt.id from learning_track_completed_chapters ltcc 
                    inner join learning_tracks lt on lt.id = ltcc.learning_track_id 
                    where ltcc.user_id = $1 and lt.user_id = u.id limit 1
                    ) is not null
                ) as "usersWithLearningTrack",
                u.id,
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
                (select  
                count(*) as "totalFriends" 
                from friends_circle fc   
                where fc.user_id = u.id
                order by "totalFriends" desc) as "total_friends",
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
                where u.id != $1 and 
                (
                        (select id from friends_circle fc where fc.friend_id = u.id and fc.user_id = $1) is null and
                        (
                            -- contacts
                            (concat(u.dial_code, replace(replace(u.phone, '-', ''),' ', '')) = any($3) is true or u.email = any($2) is true)
                            or
                            (-- posts that user sent ooz
                                select pur.id
                                from posts_users_rewarded pur
                                inner join posts p on p.id = pur.post_id
                                where pur.user_id = $1 and p.user_id = u.id limit 1
                            ) is not null 
                            or 
                            ( -- posts that user received ooz
                                select pur.id
                                from posts_users_rewarded pur
                                inner join posts p on p.id = pur.post_id
                                where pur.user_id = u.id and p.user_id = $1 limit 1
                            ) is not null 
                            or
                            ( -- posts that user has commented on
                                select pc.id from posts_comments pc
                                inner join posts p on p.id = pc.post_id
                                where pc.user_id = u.id and p.user_id = $1 limit 1
                            ) is not null 
                            or
                            ( -- comments the user received on the post
                                select pc.id
                                from posts_comments pc
                                inner join posts p on p.id = pc.post_id
                                where pc.user_id = $1 and p.user_id = u.id limit 1
                            ) is not null 
                            or
                            (  -- five users with the most friends
                                select 
                                    "usersWithMoreFriends".user_id
                                from (
                                    select 
                                        distinct user_id, 
                                        count(*) as "totalFriends" 
                                    from friends_circle fc 
                                    where user_id = u.id
                                    group by fc.user_id 
                                    order by "totalFriends" desc
                                    limit 5
                                ) "usersWithMoreFriends" 
                                where u.id = "usersWithMoreFriends".user_id
                            ) is not null
                            or
                            ( -- five users with the most friends
                                select 
                                    json_extract_path_text(cast(market_place_data AS json),'userId') as "userId"
                                from wallet_transfers wt 
                                where 
                                json_extract_path_text(cast(market_place_data AS json),'userId') is not null and
                                json_extract_path_text(cast(market_place_data AS json),'userId')::text != 'ootopia'::text and
                                json_extract_path_text(cast(market_place_data AS json),'userId')::text != $1::text and
                                wt.user_id = u.id and
                                    wt."action" = 'sent' and
                                    wt.processed is true and 
                                    wt.removed is false and
                                    wt.origin = 'market_place_transfer' limit 1
                            ) is not null 
                            or
                            ( -- owners of learning tracks the user watched
                                select distinct lt.id from learning_track_completed_chapters ltcc 
                                    inner join learning_tracks lt on lt.id = ltcc.learning_track_id 
                                    where ltcc.user_id = $1 and lt.user_id = u.id limit 1
                            ) is not null 
                        )
                        
                    ) order by 
                           "isContact" desc, 
                           "sentOOzOfPosts" desc,
                           "recevedOOzOfPosts" desc, 
                           "usersCommentedOnPosts" desc, 
                           "commentsReceivedOnthePosts" desc, 
                           "usersWithMoreFriends" desc,
                           "usersWithMarketPlace" desc,
                           "usersWithLearningTrack" desc
                       limit $5 offset $4;`,
                [suggestedFriends.id, suggestedFriends.importedContactEmails, suggestedFriends.importedContactNumbers, suggestedFriends.offset, suggestedFriends.limit],
            )
        );

    }

}