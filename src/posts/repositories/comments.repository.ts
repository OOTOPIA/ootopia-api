import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { PostsComments } from "../entities/comments.entity";

@Injectable()
@EntityRepository(PostsComments)
export class CommentsRepository extends Repository<PostsComments>{

    constructor() {
        super();
    }

    async createComment(data) {

        const comment = this.create();
        Object.assign(comment, data);
        let result = await this.save(comment);

        await this.recalculateCommentCount(data.postId);

        return result;

    }

    private async recalculateCommentCount(postId : string) {

        let result = await getConnection().query(`
            INSERT INTO posts_comments_count (post_id, comments_count)
            VALUES($1, COALESCE((select sum(count(post_id)) OVER (ORDER BY post_id) from posts_comments where post_id = $1 and deleted = false group by post_id), 0)) 
            ON CONFLICT (post_id) 
            DO 
            UPDATE SET comments_count = COALESCE((select sum(count(post_id)) OVER (ORDER BY post_id) as total_comments_count from posts_comments where post_id = $1 and deleted = false group by post_id), 0), updated_at = now()
            RETURNING *;
        `, [
            postId
        ]);

        return result.length ? result[0] : null;

    }

    async getCommentsFromPostId(postId, page) {

        let filters = {
            postId : postId,
            page : page
        }

        if (!filters.postId) {
            throw new HttpException('Post ID is mandatory', 401);
        }

        let where = "c.deleted = false AND ", params = [];
        let perPage = 10, limit = 'LIMIT ' + perPage;
        let columns = [
            'c.id', 'c.post_id', 'c.user_id', 'c.text', 'c.deleted', 'c.created_at', 'c.updated_at',
            'users.photo_url', 'users.fullname as username'
        ];

        if (filters.postId) {
            params.push(filters.postId);
            where += `c.post_id = $${params.length} AND `;
        }

        if (filters.page) {
            limit = 'LIMIT ' + perPage + ' OFFSET ' + ((filters.page > 1 ? filters.page - 1 : 0) * perPage);
        }

        where = where.substring(0, where.length - 5);

        return camelcaseKeys(await getConnection().query(`
            SELECT 
                ${columns},
                array_to_json(
                    (
                        select ARRAY_AGG(
                            jsonb_build_object('id',u.id, 'fullname', u.fullname, 'photoUrl', u.photo_url)
                        ) 
                        from (SELECT unnest(c.tagged_user) as id ) as tagged_users
                        inner join users u on u.id = tagged_users.id
                    )
                ) as "users_comments"
            FROM posts_comments c
            INNER JOIN users ON users.id = c.user_id
            WHERE ${where}
            ORDER BY c.created_at DESC
            ${limit}
        `, params), { deep : true });

    }

    async deleteComments(userId : string, post, commentsIds : string[]) {

        let queryRunner = getConnection().createQueryRunner();
    
        await queryRunner.startTransaction();

        try {

            for (let i = 0; i < commentsIds.length; i++) {
                let id = commentsIds[i];

                let whereConditions : any = {
                    id : id,
                    postId : post.id
                };

                if (userId != post.userId) {
                    whereConditions.userId = userId;
                }

                await queryRunner.manager.update(PostsComments, whereConditions, {
                    deleted : true
                });
            }

            await queryRunner.commitTransaction();
            await this.recalculateCommentCount(post.id);

        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }

        return {
            status: 200,
        };

    }

}