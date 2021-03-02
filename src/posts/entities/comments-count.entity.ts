import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { Posts } from '../posts.entity';

@Entity()
export class PostsCommentsCount extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id : string;

  @OneToOne(type => Posts, post => post.id)
  @JoinColumn({ name: "post_id" })
  postId : Posts;

  @Column({ nullable: false, type: 'numeric', name : 'comments_count', default: () => "0" })
  commentsCount : number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}