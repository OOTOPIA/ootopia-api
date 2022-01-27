import { Users } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class UsersDeviceToken extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column({ nullable: false, type: "varchar", name : "user_id" })
    userId : string;
    
    @Column({unique: true, nullable: false, type: "varchar", name: 'device_id' })
    deviceId : string;

    @Column({ nullable: true, type: "varchar", name: 'device_token' })
    deviceToken : string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
