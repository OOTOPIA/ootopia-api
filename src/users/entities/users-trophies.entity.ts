
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

export enum TrophyType {
    PERSONAL = "personal",
    CITY = "city",
    GLOBAL = "global",
};

@Entity()
export class UsersTrophies extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;
  
    @ManyToOne(type => Users, user => user.id)
    @JoinColumn({ name: "user_id" })
    userId : Users;

    @Column({ 
        nullable: false, 
        type: "enum",
        enum: TrophyType,
        name: 'trophy_type',
    })
    trophyType : TrophyType;

    @Column({ nullable: false, type: 'numeric', default: () => "0" })
    quantity : number;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}
