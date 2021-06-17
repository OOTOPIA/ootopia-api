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
    USER_REWARD_PER_MINUTE_OF_WATCHED_VIDEO = "user_reward_per_minute_of_watched_video",
    USER_REWARD_PER_MINUTE_OF_TIMELINE_VIEW_TIME = "user_reward_per_minute_of_timeline_view_time",
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