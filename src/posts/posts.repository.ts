import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { Posts } from "./posts.entity";

@Injectable()
@EntityRepository(Posts)
export class PostsRepository extends Repository<Posts>{

    constructor() {
        super();
    }

    createOrUpdatePost(postData) {
        const post = this.create();
        Object.assign(post, postData);
        return this.save(post);
    }

    async likePost(postId : string, userId : string) {

        let likeResult = await getConnection().query(`
            INSERT INTO posts_likes (post_id, user_id)
            SELECT $1, $2
            WHERE NOT EXISTS (
                SELECT * FROM posts_likes WHERE post_id = $1 AND user_id = $2
            )
            RETURNING *;
        `, [
            postId,
            userId
        ]);

        let result = { count : 0, liked : false };

        //Caso seja uma nova curtida, aumentar a quantidade de likes.
        //Caso contrário, remover a curtida e diminuir a quantidade de likes.

        if(likeResult.length) {
            result.liked = true;
        }else{

            await getConnection().query(`
                DELETE FROM posts_likes
                WHERE post_id = $1 AND user_id = $2
            `, [
                postId,
                userId
            ]); 

        }

        console.log("likeResult", result);
        let likesCountResult = await this.recalculateLikesCount(postId);

        if (likesCountResult) {
            result.count = +likesCountResult.likes_count;
        }

        return result;

    }

    private async recalculateLikesCount(postId : string) {

        let result = await getConnection().query(`
            INSERT INTO posts_likes_count (post_id, likes_count)
            VALUES($1, COALESCE((select sum(count(post_id)) OVER (ORDER BY post_id) from posts_likes where post_id = $1 group by post_id), 0)) 
            ON CONFLICT (post_id) 
            DO 
            UPDATE SET likes_count = COALESCE((select sum(count(post_id)) OVER (ORDER BY post_id) as total_likes_count from posts_likes where post_id = $1 group by post_id), 0), updated_at = now()
            RETURNING *;
        `, [
            postId
        ]);

        return result.length ? result[0] : null;

    }

    getPostById(id) {
        return this.findOne({
            where: { id }
        });
    }

}