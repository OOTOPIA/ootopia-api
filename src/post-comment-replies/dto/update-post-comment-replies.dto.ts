import { PartialType } from '@nestjs/mapped-types';
import { CreatePostCommentRepliesDto } from './create-post-comment-replies.dto';

export class UpdatePostCommentReplyDto extends PartialType(CreatePostCommentRepliesDto) {}
