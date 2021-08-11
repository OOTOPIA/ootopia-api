import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { PostsWatchedVideotime } from "../entities/posts-watched-videotime.entity";
import * as camelcaseKeys from 'camelcase-keys';

@Injectable()
@EntityRepository(PostsWatchedVideotime)
export class PostsWatchedVideotimeRepository extends Repository<PostsWatchedVideotime>{

    constructor() {
        super();
    }

    async recordWatchedVideotime(data) {
        const postWatchedVideotime = this.create();
        Object.assign(postWatchedVideotime, data);
        return postWatchedVideotime;
    }

    async getPostWatchedVideotimeById(postId : string) {
        return await this.findOne({
            where : { postId }
        });
    }

    async getUsersIdsWhoWatchedVideosInThisPeriod(startDateTime : Date, page : number) {
        let perPage = 100,
            limit = 'LIMIT ' + perPage + ' OFFSET ' + ((page > 1 ? page - 1 : 0) * perPage);

        return camelcaseKeys(await getConnection().query(`
            SELECT * FROM (
                SELECT user_id FROM posts_watched_videotime WHERE created_at BETWEEN $1 and now() at time zone 'UTC'
            ) t 
            GROUP BY t.user_id
            ${limit}
        `, [startDateTime]), { deep : true });
    }

    async getTimeSumOfUserWatchedVideosInThisPeriod(userId : string, startDateTime : Date) {
        return camelcaseKeys(await getConnection().query(`
            SELECT sum(time_in_milliseconds) FROM posts_watched_videotime 
            WHERE user_id = $1 AND created_at BETWEEN $2 and now() at time zone 'UTC';
        `, [userId, startDateTime]), { deep : true });
    }

}