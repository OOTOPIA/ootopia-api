import { Users } from 'src/users/users.entity';
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
import { InterestsTags } from './interests-tags.entity';
  
@Entity()
export class InterestsTagsUsers extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @OneToOne(type => Users, user => user.id)
    @JoinColumn({ name: "user_id" })
    userId : Users;

    @OneToOne(type => InterestsTags, tag => tag.id)
    @JoinColumn({ name: "tag_id" })
    tagId : InterestsTags;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}