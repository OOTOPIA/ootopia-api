
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
import { Users } from '../users.entity';

@Entity()
export class AdminUsers extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;
  
    @OneToOne(type => Users, user => user.id)
    @JoinColumn({ name: "user_id" })
    user : Users;

    @Column({ nullable: false, type: 'uuid', name: 'user_id' })
    userId : string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}
