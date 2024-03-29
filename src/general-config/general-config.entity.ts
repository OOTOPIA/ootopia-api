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
    CREATOR_REWARD_PER_MINUTE_OF_POSTED_VIDEO = "creator_reward_per_minute_of_posted_video",
    CREATOR_REWARD_FOR_POSTED_PHOTO = "creator_reward_for_posted_photo",
    USER_REWARD_PER_MINUTE_OF_WATCHED_VIDEO = "user_reward_per_minute_of_watched_video",
    USER_REWARD_PER_MINUTE_OF_TIMELINE_VIEW_TIME = "user_reward_per_minute_of_timeline_view_time",
    CREATOR_REWARD_FOR_WOOW_RECEIVED = "creator_reward_for_woow_received",
    GLOBAL_GOAL_LIMIT_TIME_IN_UTC = "global_goal_limit_time_in_utc",
    USER_SENT_SOWER_INVITATION_CODE_OOZ = "user_sent_sower_invitation_code_ooz",
    USER_RECEIVED_SOWER_INVITATION_CODE_OOZ = "user_received_sower_invitation_code_ooz",
    USER_SENT_DEFAULT_INVITATION_CODE_OOZ = "user_sent_default_invitation_code_ooz",
    USER_RECEIVED_DEFAULT_INVITATION_CODE_OOZ = "user_received_default_invitation_code_ooz",
    LEARNING_TRACK_PER_MINUTE_OF_WATCHED_VIDEO = "learning_track_per_minute_of_watched_video",
    USER_REWARD_WHEN_GUEST_SIGNUP_WITH_CODE = "user_reward_when_guest_signup_with_code",
    OOZ_BY_POST = "ooz_by_post",
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