
import { LearningTracks } from 'src/learning-tracks/learning-tracks.entity';
import { MarketPlaceProducts } from 'src/market-place/entities/market-place-products.entity';
import { Posts } from 'src/posts/posts.entity';
import { Wallets } from 'src/wallets/wallets.entity';
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
    JoinColumn,
} from 'typeorm';

import { Users } from '../users/users.entity';

export enum Origin {
  VIDEO_VIEW = "video_view",
  VIDEO_LIKE = "video_like",
  TRANSFER = "transfer",
  TIMELINE_VIEW = "timeline_view",
  WATCHED_VIDEOS = "watched_videos",
  POSTED_VIDEOS = "posted_videos",
  POSTED_PHOTOS = "posted_photos",
  TOTAL_GAME_COMPLETED = "total_game_completed",
  PERSONAL_GOAL_ACHIEVED = "personal_goal_achieved",
  GRATITUDE_REWARD = "gratitude_reward",
  INVITATION_CODE = "invitation_code",
  INVITATION_CODE_SENT = "invitation_code_sent",
  INVITATION_CODE_ACCEPTED = "invitation_code_accepted",
  MARKET_PLACE_TRANSFER = "market_place_transfer",
  LEARNING_TRACK = "learning_track",
};

export enum WalletTransferAction {
  SENT = "sent",
  RECEIVED = "received",
};

@Entity()
export class WalletTransfers extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id : string;

  @ManyToOne(type => Users, user => user.id)
  @JoinColumn({ name: "user_id" })
  userId : string;

  @ManyToOne(type => Wallets, wallet => wallet.id)
  @JoinColumn({ name: "wallet_id" })
  walletId : string;

  @ManyToOne(type => Users, user => user.id, { nullable : true })
  @JoinColumn({ name: "other_user_id" })
  otherUserId? : string;

  @ManyToOne(type => Posts, post => post.id, { nullable : true })
  @JoinColumn({ name: "post_id" })
  postId? : string;

  @ManyToOne(type => MarketPlaceProducts, marketPlace => marketPlace.id, { nullable : true })
  @JoinColumn({ name: "market_place_id" })
  marketPlaceId? : string;

  @Column({ nullable : true, type: 'simple-json', name : 'market_place_data'})
  marketPlaceData : any;

  @ManyToOne(type => LearningTracks, learningTrack => learningTrack.id, { nullable : true })
  @JoinColumn({ name: "learning_track_id" })
  learningTrackId? : string;

  @Column({ nullable: true, type: 'varchar' })
  description : string;

  @Column({ 
    nullable: true, 
    type: "enum",
    enum: Origin,
  })
  origin : Origin;

  @Column({ 
    nullable: true, 
    type: "enum",
    enum: WalletTransferAction,
  })
  action : WalletTransferAction;

  @Column({ nullable : false, type: 'numeric', default: () => "0"})
  balance : number;

  @Column({ nullable : false, type: 'boolean', name: 'from_platform', default: () => "false" })
  fromPlatform : boolean;

  @Column({ nullable : false, type: 'boolean', default: () => "false"})
  processed : boolean;

  //Este campo será TRUE quando as transferências da mesma origem forem agrupadas e processadas pelo worker. 
  //Sendo assim, as transferências "fragmentadas" são removidas pois elas foram agrupadas e somadas ao valor total de OOZ do usuário
  @Column({ nullable : false, type: 'boolean', default: () => "false"})
  removed : boolean; 

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
