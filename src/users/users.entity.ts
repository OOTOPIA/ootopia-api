import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
} from 'typeorm';
  
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

    @Column({ nullable: true, name: 'address_country_code', type: 'varchar' })
    addressCountryCode : string;

    @Column({ nullable: true, name: 'address_state', type: 'varchar' })
    addressState : string;

    @Column({ nullable: true, name: 'address_city', type: 'varchar' })
    addressCity : string;

    @Column({ nullable: true, name: 'address_latitude', type: 'numeric' })
    addressLatitude : number;

    @Column({ nullable: true, name: 'address_longitude', type: 'numeric' })
    addressLongitude : number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}