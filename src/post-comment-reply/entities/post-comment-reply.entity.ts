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
export class PostCommentReply extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id : string;

    @OneToOne(type => Posts, post => post.id)
    @JoinColumn({ name: "post_id" })
    post : Posts;

    @Column({ name: "post_id", nullable : false, type: "uuid" })
    postId: Posts;

    @OneToOne(type => PostsComments, post => post.id)
    @JoinColumn({ name: "comment_id" })
    comment: PostsComments;

    @Column({ name: "comment_id", nullable : false, type: "uuid" })
    commentId: PostsComments;

    @Column({ nullable : true, type: 'varchar'})
    text : string;

    @Column({ name: "tagged_user", nullable : false, array: true, type: "uuid" })
    taggedUser: Users[];

    @Column({ nullable : true, type: 'boolean', default: () => "false" })
    deleted : boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
