import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, Not, IsNull } from "typeorm";
import { PostCommentReplies } from "./entities/post-comment-replies.entity";
import { GetPostCommentRepliesParamsDto } from "./dto/get-post-comment-replies.dto";
import { CreatePostCommentRepliesDto, CreatePostCommentRepliesServiceDto } from "./dto/create-post-comment-replies.dto";


@Injectable()
@EntityRepository(PostCommentReplies)
export class PostCommentRepliesRepository extends Repository<PostCommentReplies>{

    constructor() {
        super();
    }

    createCommentReply(createPostCommentReply: CreatePostCommentRepliesServiceDto) {
        let commentReply = this.create();
        Object.assign(commentReply, createPostCommentReply);
        return this.save(commentReply);
    }

    findRepliesByComment(page: GetPostCommentRepliesParamsDto) {
        return this.query(`
        select 
            pcr.id,
            pcr."text",
            pcr.comment_id as "commentId",
            pcr.tagged_user_ids as "taggedUserIds",
            pcr.comment_user_id as "commentUserId",
            pcr.reply_to_user_id as "replyToUserId",
            u.photo_url as "photoCommentUser",
            u.fullname as "fullNameCommentUser",
            array_to_json(
                (
                    select ARRAY_AGG(
                        jsonb_build_object('id',u2.id, 'fullname', u2.fullname,'email', u2.email,'photoUrl', u2.photo_url)
                    ) 
                    from (SELECT unnest(pcr.tagged_user_ids) as id ) as tagged_users
                    inner join users u2 on u2.id = tagged_users.id
                )
            ) as "usersComments"
        from post_comment_replies pcr
        inner join users u on u.id = pcr.comment_user_id 
        where pcr.comment_id = $1 and pcr.deleted is null 
        order by pcr.created_at desc 
        offset $2 limit $3 ;`, [page.commentId, page.skip, page.limit]);
    }

    commentReplyById(id: string) {
        return this.query(`
            select 
            pcr.id,
            pcr."text",
            pcr.comment_id as "commentId",
            pcr.tagged_user_ids as "taggedUserIds",
            pcr.comment_user_id as "commentUserId",
            pcr.reply_to_user_id as "replyToUserId",
            u.photo_url as "photoCommentUser",
            u.fullname as "fullNameCommentUser",
            array_to_json(
                (
                    select ARRAY_AGG(
                        jsonb_build_object('id',u2.id, 'fullname', u2.fullname,'email', u2.email,'photoUrl', u2.photo_url)
                    ) 
                    from (SELECT unnest(pcr.tagged_user_ids) as id ) as tagged_users
                    inner join users u2 on u2.id = tagged_users.id
                )
            ) as "usersComments"
            from post_comment_replies pcr
            inner join users u on u.id = pcr.comment_user_id 
            where pcr.id = $1 and 
            deleted is null
            ;`,
            [id]
        );
    }

    deleteCommentReply(id) {
        let commentReply = this.create();
        Object.assign(commentReply, {id});
        commentReply.deleted = new Date();
        return this.save(commentReply);
    }
}