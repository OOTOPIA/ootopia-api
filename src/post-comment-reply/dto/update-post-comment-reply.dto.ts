import { PartialType } from '@nestjs/mapped-types';
import { CreatePostCommentReplyDto } from './create-post-comment-reply.dto';

export class UpdatePostCommentReplyDto extends PartialType(CreatePostCommentReplyDto) {}
