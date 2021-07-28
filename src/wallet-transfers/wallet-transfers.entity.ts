
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
