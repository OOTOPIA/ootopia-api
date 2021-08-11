import { Addresses } from 'src/addresses/addresses.entity';
import { Users } from 'src/users/users.entity';
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
  JoinColumn
} from 'typeorm';

enum PostType {
  Image = "image",
  Video = "video"
}

@Entity()
export class Posts extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id : string;

  @ManyToOne(type => Users, user => user.id)
  @JoinColumn({ name: "user_id" })
  userId : Users;

  @Column({ nullable: true, type: 'varchar' })
  description : string;

  @Column({nullable: false, type: 'varchar'})
  type: PostType;

  @Column({ nullable: true, name: "image_url" , type: 'varchar' })
  imageUrl : string;

  @Column({ nullable: true, name: "video_url", type: 'varchar' })
  videoUrl : string;

  @Column({ nullable: true, name: "thumbnail_url", type: 'varchar' })
  thumbnailUrl : string;

  @Column({ nullable : true, name: "video_status", type: 'varchar' })
  videoStatus : string;

  @Column({ nullable: true, name: "stream_media_id", type: 'varchar' })
  streamMediaId : string;

  @Column({ nullable : false, name: "ooz_total_collected", type: 'numeric', default: () => "0"})
  oozTotalCollected : number;

  @ManyToOne(type => Addresses, address => address.id)
  @JoinColumn({ name : "address_id" })
  addressId : Addresses;

  @Column({ nullable : true, name: "duration_in_secs", type: 'numeric', default: () => "0"})
  durationInSecs : number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({nullable : true, name: 'deleted_at', type: 'timestamp'})
  deletedAt: Date;

}

@Entity()
export class PostsLikes extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id : string;

  @ManyToOne(type => Posts, post => post.id)
  @JoinColumn({ name: "post_id" })
  post : Posts;

  @ManyToOne(type => Users, user => user.id)
  @JoinColumn({ name: "user_id" })
  user : Users;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}

@Entity()
export class PostsLikesCount extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id : string;

  @OneToOne(type => Posts, post => post.id)
  @JoinColumn({ name: "post_id" })
  post : Posts;

  @Column({ nullable: false, type: 'numeric', name : 'likes_count', default: () => "0" })
  likesCount : number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}