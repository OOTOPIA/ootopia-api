import { User } from '@sentry/node';
import { PostsComments } from 'src/posts/entities/comments.entity';
import { Posts } from 'src/posts/posts.entity';
import { Users } from 'src/users/users.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToOne,
    JoinColumn,
    ManyToOne
} from 'typeorm';

@Entity()
export class PostCommentReplies extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id : string;

    @ManyToOne(type => PostsComments, post => post.id)
    @JoinColumn({ name: "comment_id" })
    commentId: PostsComments;

    @Column({ name: "tagged_user_ids", nullable : true, array: true, type: "uuid" })
    taggedUserIds: Users[];
    
    @Column({ nullable : false, type: 'varchar'})
    text : string;
    
    @ManyToOne(type => Users, users => users.id)
    @JoinColumn({ name: "comment_user_id" })
    commentUserId: User;

    @ManyToOne(type => Users, users => users.id)
    @JoinColumn({ name: "reply_to_user_id" })
    replyToUser: User;

    @Column({ nullable : false, name: "reply_to_user_id", type: "uuid"})
    replyToUserId: string;

    @Column({ nullable : true })
    deleted : Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
