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
            u.photo_url as "photoCommentUser",
            u.fullname as "fullNameCommentUser",
            array_to_json(
                (
                    select ARRAY_AGG(
                        jsonb_build_object('id',uc.id, 'fullname', uc.fullname, 'photoUrl', uc.photo_url)
                    ) from users uc where uc.id = any(pcr.tagged_user_ids)
                )
            ) as "users_comments"
        from post_comment_replies pcr
        inner join users u on u.id = pcr.comment_user_id 
        where pcr.comment_id = $1 and pcr.deleted is null 
        order by pcr.created_at asc 
        offset $2 limit $3 ;`, [page.commentId, page.skip, page.limit]);
        // return this.find({
        //     select: ['id',"commentId","text", "taggedUserIds","commentUserId"],
        //     where: {
        //         commentId: page.commentId,
        //         deleted: IsNull()
        //     },
        //     skip: page.skip,
        //     take: page.limit,
        // });
    }

    deleteCommentReply(id) {
        let commentReply = this.create();
        Object.assign(commentReply, {id});
        commentReply.deleted = new Date();
        return this.save(commentReply);
    }
}