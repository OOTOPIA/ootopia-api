import { Addresses } from 'src/addresses/addresses.entity';
import { Users } from 'src/users/users.entity';
import { Posts } from 'src/posts/posts.entity';
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
    Video = "video",
}

@Entity()
export class Medias extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Posts, post => post.id)
    @JoinColumn({ name: "post_id" })
    post: Posts;

    @Column({ nullable: true, type: 'varchar', name: "post_id" })
    postId: string;

    @Column({ nullable: false, type: 'varchar' })
    type: PostType;

    @Column({ nullable: true, name: "media_url", type: 'varchar' })
    mediaUrl: string;

    @Column({ nullable: true, name: "thumbnail_url", type: 'varchar' })
    thumbnailUrl: string;

    @Column({ name: "finished", type: 'varchar', default: 'unready'})
    status: string;

    @Column({ nullable: true, name: "stream_media_id", type: 'varchar' })
    streamMediaId: string;

    @Column({ nullable: true, name: "duration_in_secs", type: 'numeric', default: () => "0" })
    durationInSecs: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ nullable: true, name: 'deleted_at', type: 'timestamp' })
    deletedAt: Date;

}
