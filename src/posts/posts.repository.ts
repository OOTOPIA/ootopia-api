import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult } from "typeorm";
import { Posts } from "./posts.entity";

@Injectable()
@EntityRepository(Posts)
export class PostsRepository extends Repository<Posts>{

    createOrUpdatePost(postData) {
        const post = this.create();
        Object.assign(post, postData);
        return this.save(post);
    }

    likePost(userId : string, postId : string) {

    }

    getPostById(id) {
        return this.findOne({
            where: { id }
        });
    }

}