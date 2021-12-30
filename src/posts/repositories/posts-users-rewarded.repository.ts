import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { PostsUsersRewarded } from "../entities/posts-users-rewarded.entity";

@Injectable()
@EntityRepository(PostsUsersRewarded)
export class PostsUsersRewardedRepository extends Repository<PostsUsersRewarded>{

    constructor() {
        super();
    }

    async countReward(postId : string, userId : string, oozRewarded : number) {

        let countResult = await getConnection().query(`
            INSERT INTO posts_users_rewarded (post_id, user_id, ooz_rewarded)
            SELECT $1, $2, $3
            WHERE NOT EXISTS (
                SELECT * FROM posts_users_rewarded WHERE post_id = $1 AND user_id = $2
            )
            RETURNING *;
        `, [
            postId,
            userId,
            oozRewarded
        ]);

        if(!countResult.length) {
            await this.sumPostUserRewarded(postId, userId, oozRewarded);
        }
        
    }

    private async sumPostUserRewarded(postId : string, userId : string, oozRewarded : number) {

        let result = await getConnection().query(`
            UPDATE posts_users_rewarded SET ooz_rewarded = ooz_rewarded+$3 
                WHERE post_id = $1 AND
                user_id = $2
            RETURNING *;
        `, [
            postId,
            userId,
            oozRewarded,
        ]);

        return result.length ? result[0] : null;
        
    }

}