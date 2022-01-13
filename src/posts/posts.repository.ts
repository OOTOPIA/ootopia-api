import { HttpException, Injectable } from "@nestjs/common";
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

    async deletePostByUser(postId, userId) {
        const post = await this.findOne({
            where : {
                id : postId, 
                userId : userId
            }
        });
        if (!post) {
            throw new HttpException("Permission denied", 403);
        }
        post.videoStatus = "deleted";
        post.deletedAt = new Date();
        return await this.save(post);
    }

    //Método usado somente para caso haja uma exceção na transaction do método createPost
    deletePost(id) {
        if (!id) {
            return null;
        }
        return this.delete(id);
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

    async incrementOOZTotalCollected(balance : number, postId : string) {
        const post = await this.findOne({
            where: {
                id : postId
            },
        });
        if (!post.oozTotalCollected) {
            post.oozTotalCollected = 0;
        }
        post.oozTotalCollected = +(+post.oozTotalCollected + +balance).toFixed(2);
        return post;
    }

    async getPostById(id) : Promise<Posts> {
        let results = camelcaseKeys(await getConnection().query(`
            SELECT 
                p.*
            FROM posts p
            WHERE p.id = $1 and deleted_at is null
        `, [id]), { deep : true });
        return results.length ? results[0] : null;
    }

    getPostByStreamMediaId(streamMediaId) {
        return this.findOne({
            where: { streamMediaId }
        });
    }

    async getPostsTimeline(filters, userId? : string) {

        let where = "(video_status = 'ready' OR (video_status is null AND type = 'image')) AND deleted_at is null AND ";
        const params = [];
        const perPage = 10;
        let limit = 'LIMIT ' + perPage;
        let locale = 'en-US';
        const columns = [
          'p.id',
          'p.user_id',
          'p.description',
          'p.type',
          'p.image_url',
          'p.video_url',
          'p.thumbnail_url',
          'p.video_status',
          'p.ooz_total_collected',
          'users.photo_url',
          'users.fullname as username',
          'COALESCE(pl.likes_count, 0)::integer as likes_count',
          'COALESCE(pc.comments_count, 0)::integer as comments_count',
          'c.city',
          'c.state',
          'c.country',
        ];

        if (filters.postId) {
            params.push(filters.postId);
            where = where + `p.id = $${params.length} AND `;
        }

        if (filters.userId) {
            params.push(filters.userId);
            where = where + `p.user_id = $${params.length} AND `;
        }

        if (filters.limit && filters.offset) {
            if (filters.limit > 50) {
                filters.limit = 50;
            }
            //limit = 'LIMIT ' + perPage + ' OFFSET ' + ((filters.page > 1 ? filters.page - 1 : 0) * perPage);
            limit = 'LIMIT ' + filters.limit + ' OFFSET ' + filters.offset;
        }

        if (filters.locale && ['en', 'pt-BR'].indexOf(filters.locale) != -1) {
            locale = filters.locale;
            if (locale == "en") {
                locale = "en-US";
            }
        }

        if (userId) {
            params.push(userId);
            columns.push(`(CASE WHEN $${params.length}=(
                SELECT user_id from posts_likes WHERE post_id = p.id and posts_likes.user_id = $${params.length}) 
                THEN true ELSE false END) as liked`);
            columns.push(`COALESCE(pur.ooz_rewarded, 0)::numeric as ooz_rewarded`);
        }

        where = where.substring(0, where.length - 5);

        return camelcaseKeys(await getConnection().query(`
            SELECT 
                ${columns}, array(
                        select t.name
                        from interests_tags_posts tp
                        inner join interests_tags t on (t.id = tp.tag_id or t.related_id = tp.tag_id::text)
                        where tp.post_id = p.id and t.language = '${locale}'
                    ) as tags,
                    array (
                        select 
                        json_build_object('Icon', b.icon, 'Name', b.name) as bdg
                        from user_badges
                        inner join badges b ON b.id = user_badges.badges_id
                        where user_badges.user_id = p.user_id
                    ) as badges
            FROM posts p
            INNER JOIN users ON users.id = p.user_id
            LEFT JOIN posts_likes_count pl ON pl.post_id = p.id
            LEFT JOIN posts_comments_count pc ON pc.post_id = p.id
            LEFT JOIN addresses addr ON addr.id = p.address_id
            LEFT JOIN cities c ON c.id = addr.city_id
            ${userId ? "LEFT JOIN posts_users_rewarded pur ON pur.post_id = p.id AND pur.user_id = $" + params.length : ""}
            WHERE ${where}
            ORDER BY p.created_at DESC
            ${limit}
        `, params), { deep : true })
        .map((post) => {
            post.oozRewarded = +post.oozRewarded;
            //post.oozTotalCollected = +post.oozTotalCollected;
            post.oozToTransfer = 0;
            if (!userId) {
                post.liked = false;
            }
            post.liked = post.liked || false;
            return post;
        });

    }

}