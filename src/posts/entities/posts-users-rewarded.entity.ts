
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
export class PostsUsersRewarded extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id : string;

  @ManyToOne(type => Posts, post => post.id, { primary : true })
  @JoinColumn({ name: "post_id" })
  postId : Posts;

  @ManyToOne(type => Users, user => user.id, { primary : true })
  @JoinColumn({ name: "user_id" })
  userId : Users;

  @Column({ nullable: false, type: 'numeric', name : 'ooz_rewarded', default: () => "0" })
  oozRewarded : number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
