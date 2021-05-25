import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Addresses } from '../addresses/addresses.entity';
  
@Entity()
export class Users extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column({ nullable: false, type: 'varchar' })
    fullname : string;

    @Column({ nullable: false, type: 'varchar' })
    email : string;

    @Column({ nullable: false, type: 'varchar' })
    password : string;

    @Column({ nullable: true, type: 'date' })
    birthdate : Date;

    @Column({ nullable: true, name: 'photo_url', type: 'varchar' })
    photoUrl : string;

    @Column({ nullable: true, type: 'varchar' })
    bio : string;

    @Column({ nullable: true, name: 'daily_learning_goal_in_minutes', type: 'numeric', default: () => "0" })
    dailyLearningGoalInMinutes : number;

    @Column({ nullable : true, name : 'enable_sustainable_ads', type: 'boolean', default: () => "true" })
    enableSustainableAds : boolean;

    @Column({ nullable: false, type: 'numeric', name : 'register_phase', default: () => "1" })
    registerPhase : number;

    @Column({ nullable : true, name : 'dont_ask_again_to_confirm_gratitude_reward', type: 'boolean', default: () => "false" })
    dontAskAgainToConfirmGratitudeReward : boolean;

    @ManyToOne(type => Addresses, address => address.id)
    @JoinColumn({ name : "address_id" })
    addressId : Addresses;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}