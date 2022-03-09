import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, Not, IsNull } from "typeorm";
import { PostCommentReplies } from "./entities/post-comment-replies.entity";
import { GetPostCommentRepliesParamsDto } from "./dto/get-post-comment-replies.dto";
import { CreatePostCommentRepliesDto } from "./dto/create-post-comment-replies.dto";


@Injectable()
@EntityRepository(PostCommentReplies)
export class PostCommentRepliesRepository extends Repository<PostCommentReplies>{

    constructor() {
        super();
    }

    createCommentReply(createPostCommentReply: CreatePostCommentRepliesDto) {
        let commentReply = this.create();
        Object.assign(commentReply, createPostCommentReply);
        return this.save(commentReply);
    }

    findRepliesByComment(page: GetPostCommentRepliesParamsDto) {
        return this.find({
            select: ['id',"commentId","comment","text", "taggedUser"],
            where: {
                commentId: page.commentId,
                deleted: IsNull()
            },
            skip: page.skip,
            take: page.limit
        });
    }

    deleteCommentReply(id) {
        let commentReply = this.create();
        Object.assign(commentReply, {id});
        commentReply.deleted = new Date();
        return this.save(commentReply);
    }
}