import { Users } from '../../users/users.entity';

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

@Entity()
export class FriendsCircle extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;
  
    @ManyToOne(type => Users, user => user.id)
    @JoinColumn({ name: "user_id" })
    user : Users;

    @ManyToOne(type => Users, user => user.id)
    @JoinColumn({ name: "friend_id" })
    friend : Users;

    @Column({ name: "friend_id" })
    friendId: string;

    @Column({ name: "user_id" })
    userId: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}
