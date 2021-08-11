import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { PostsTimelineViewTime } from "../entities/posts-timeline-view-time.entity";
import * as camelcaseKeys from 'camelcase-keys';

@Injectable()
@EntityRepository(PostsTimelineViewTime)
export class PostsTimelineViewTimeRepository extends Repository<PostsTimelineViewTime>{

    constructor() {
        super();
    }

    async recordTimelineViewTime(data) {
        const postsTimelineViewTime = this.create();
        Object.assign(postsTimelineViewTime, data);
        return postsTimelineViewTime;
    }

    async getUsersIdsWhoViewedTimelineInThisPeriod(startDateTime : Date, page : number) {
        let perPage = 100,
            limit = 'LIMIT ' + perPage + ' OFFSET ' + ((page > 1 ? page - 1 : 0) * perPage);

        return camelcaseKeys(await getConnection().query(`
            SELECT * FROM (
                SELECT user_id FROM posts_timeline_view_time WHERE created_at BETWEEN $1 and now() at time zone 'UTC'
            ) t 
            GROUP BY t.user_id
            ${limit}
        `, [startDateTime]), { deep : true });
    }

    async getTimeSumOfUserViewedTimelineInThisPeriod(userId : string, startDateTime : Date) {
        return camelcaseKeys(await getConnection().query(`
            SELECT sum(time_in_milliseconds) FROM posts_timeline_view_time 
            WHERE user_id = $1 AND created_at BETWEEN $2 and now() at time zone 'UTC';
        `, [userId, startDateTime]), { deep : true });
    }

}