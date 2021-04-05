import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { InterestsTagsPosts } from "../entities/interests-tags-posts.entity";

@Injectable()
@EntityRepository(InterestsTagsPosts)
export class InterestsTagsPostsRepository extends Repository<InterestsTagsPosts>{

    addPostTag(postId : string, tagId : string) {
        const postTag = this.create();
        Object.assign(postTag, {
            postId,
            tagId
        });
        return postTag;
    }

}