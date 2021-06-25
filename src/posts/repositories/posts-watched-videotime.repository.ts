import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { PostsWatchedVideotime } from "../entities/posts-watched-videotime.entity";

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

}