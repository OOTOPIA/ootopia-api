import { Transform } from 'class-transformer';
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

    JoinTable,
    Generated,
    Index
} from 'typeorm';
import { Users } from '../../users/users.entity';

enum TagType {
    default = "default",
    sower = "sower"
}

@Entity()
@Index(["invitationCode"], { unique: true })
export class InvitationsCode extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;
    
    @Column({nullable : true, type: 'varchar'})
    code: string;

    @Column({name: "invitation_code", nullable : false, unique: true})
    @Generated("increment")
    invitationCode: number;

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
