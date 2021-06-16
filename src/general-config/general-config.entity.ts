import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    Unique
} from 'typeorm';

export enum ConfigName {
    TRANSFER_OOZ_TO_POST_LIMIT = "transfer_ooz_to_post_limit",
    CREATOR_REWARD_PER_MINUTE__OF_POSTED_VIDEO = "creator_reward_per_minute_of_posted_video",
};
  
@Entity()
@Unique(["name"])
export class GeneralConfig extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column({ nullable: false, type: 'enum', enum: ConfigName })
    name : string;

    @Column({nullable: false, type: 'varchar'})
    value: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}