import { Posts } from 'src/posts/posts.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    OneToOne,
    JoinColumn,
    OneToMany,
    ManyToOne
} from 'typeorm';
import { InterestsTags } from './interests-tags.entity';
  
@Entity()
export class InterestsTagsPosts extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @ManyToOne(type => Posts, post => post.id)
    @JoinColumn({ name: "post_id" })
    postId : Posts;

    @ManyToOne(type => InterestsTags, tag => tag.id)
    @JoinColumn({ name: "tag_id" })
    tagId : InterestsTags;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}