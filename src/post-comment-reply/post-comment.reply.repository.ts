import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection, Not, IsNull } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { PostCommentReply } from "./entities/post-comment-reply.entity";
import { GetPostCommentReplyParamsDto } from "./dto/get-post-comment-reply.dto";


@Injectable()
@EntityRepository(PostCommentReply)
export class PostCommentReplyRepository extends Repository<PostCommentReply>{

    constructor() {
        super();
    }

    PostCommentReply(page: GetPostCommentReplyParamsDto) {
        this.find({
            where: {
                commentId: page.commentId,
                deleted: IsNull()
            },
            skip: page.skip,
            take: page.limit
        })

    }
}