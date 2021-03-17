import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { Posts } from "./posts.entity";
import * as camelcaseKeys from 'camelcase-keys';

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

    //TODO: Melhorar insert utilizando ON CONFLICT com dois campos

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

    async updatePostVideoStatus(streamMediaId : string, status : string) {
        let post = await this.getPostByStreamMediaId(streamMediaId);
        post.videoStatus = status;
        return this.save(post);
    }

    async getPostById(id) {
        let results = camelcaseKeys(await getConnection().query(`
            SELECT 
                p.*
            FROM posts p
            WHERE p.id = $1
        `, [id]), { deep : true });

        return results.length ? results[0] : null;
    }

    getPostByStreamMediaId(streamMediaId) {
        return this.findOne({
            where: { streamMediaId }
        });
    }

    async getPostsTimeline(filters, userId? : string) {

        let where = "video_status = 'ready' AND ", params = [];
        let perPage = 10, limit = 'LIMIT ' + perPage;
        let columns = [
            'p.id', 'p.user_id', 'p.description', 'p.type', 'p.image_url', 'p.video_url', 'p.thumbnail_url', 'p.video_status',
            'users.photo_url', 'users.fullname as username', 
            'COALESCE(pl.likes_count, 0)::integer as likes_count',
            'COALESCE(pc.comments_count, 0)::integer as comments_count'
        ];

        if (filters.userId) {
            params.push(filters.userId);
            where = where + `p.user_id = $${params.length} AND `;
        }

        if (filters.page) {
            limit = 'LIMIT ' + perPage + ' OFFSET ' + ((filters.page > 1 ? filters.page - 1 : 0) * perPage);
        }

        if (userId) {
            params.push(userId);
            columns.push(`(CASE WHEN $${params.length}=(
                SELECT user_id from posts_likes WHERE post_id = p.id and posts_likes.user_id = $${params.length}) 
                THEN true ELSE false END) as liked`);
        }

        where = where.substring(0, where.length - 5);

        return camelcaseKeys(await getConnection().query(`
            SELECT 
                ${columns}
            FROM posts p
            INNER JOIN users ON users.id = p.user_id
            LEFT JOIN posts_likes_count pl ON pl.post_id = p.id
            LEFT JOIN posts_comments_count pc ON pc.post_id = p.id
            WHERE ${where}
            ORDER BY p.created_at DESC
            ${limit}
        `, params), { deep : true });

    }

}