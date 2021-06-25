import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { PostsTimelineViewTime } from "../entities/posts-timeline-view-time.entity";

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

}