
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToMany,
    ManyToMany,
    OneToOne,
    ManyToOne,
    JoinColumn
} from 'typeorm';

import { Users } from '../../users/users.entity';
import { Posts } from '../posts.entity';

@Entity()
export class PostsComments extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id : string;

  @ManyToOne(type => Posts, post => post.id)
  @JoinColumn({ name: "post_id" })
  postId : Posts;

  @ManyToOne(type => Users, user => user.id)
  @JoinColumn({ name: "user_id" })
  userId : Users;

  @Column({ nullable : true, type: 'varchar'})
  text : string;

  @Column({ nullable : true, type: 'boolean', default: () => "false" })
  deleted : boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
