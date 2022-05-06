import { Badges } from 'src/badges/entities/badges.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    OneToMany
} from 'typeorm';
import { Addresses } from '../addresses/addresses.entity';
import { LangsEnum } from './users.dto';
  
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

    @Column({ nullable: true, type: 'varchar' })
    phone : string;

    @Column({ nullable: true, type: 'varchar', name: "dial_code" })
    dialCode : string;

    @Column({ nullable: true, type: 'varchar', name: "country_code" })
    countryCode : string;

    @Column({ nullable: true, type: 'date' })
    birthdate : Date;

    @Column({ nullable: true, name: 'photo_url', type: 'varchar' })
    photoUrl : string;

    @Column({ nullable: true, type: 'varchar' })
    bio : string;
     
    @Column({ nullable: true, type: 'varchar', name: "invitation_code_accepted" })
    invitationCodeAccepted : string;

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
    
    @ManyToMany(() => Badges)
    @JoinTable({
        name: 'user_badges',
        joinColumn: {
          name: 'user_id',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'badges_id',
          referencedColumnName: 'id',
        },
    })
    badges : Badges[];

    @Column({ nullable : true, name : 'daily_goal_achieved', type: 'boolean', default: () => "false" })
    dailyGoalAchieved : boolean;

    @Column({ nullable: true, name : 'personal_dialog_opened', type: 'boolean', default: () => "false" })
    personalDialogOpened : boolean;

    @Column({ nullable: true, name : 'city_dialog_opened', type: 'boolean', default: () => "false" })
    cityDialogOpened : boolean;
    
    @Column({ nullable: true, name : 'global_dialog_opened', type: 'boolean', default: () => "false" })
    globalDialogOpened : boolean;

    @Column({ nullable: true, type: 'varchar', array: true })
    languages : LangsEnum[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ nullable: true, array: true, type: 'varchar', name : 'links' })
    links: string;
}