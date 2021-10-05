import {
    Entity,
    Unique,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
    JoinColumn,

    JoinTable
} from 'typeorm';
import { Users } from '../../users/users.entity';

enum TagType {
    default = "default",
    sower = "sower"
}

@Entity()
@Unique(['code'])
export class InvitationsCode extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;
    
    @Column({nullable : false, type: 'varchar'})
    code: String;

    @Column({ nullable: false, type: 'enum', enum: TagType })
    type : string;

    @Column({nullable : false, type: 'boolean', default: () => "false"})
    active: boolean;

    @ManyToOne(type => Users, user => user.id)
    @JoinColumn({ name : "user_id" })
    userId : Users;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}
