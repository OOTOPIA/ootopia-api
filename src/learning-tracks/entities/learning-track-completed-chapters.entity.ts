import { Users } from 'src/users/users.entity';
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
import { LearningTracks } from '../learning-tracks.entity';

  
@Entity()
export class LearningTrackCompletedChapters extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @ManyToOne(type => Users, user => user.id)
    @JoinColumn({ name: "user_id" })
    userId : Users;

    @ManyToOne(type => LearningTracks, learningTrack => learningTrack.id)
    @JoinColumn({ name: "learning_track_id" })
    learningTrackId : LearningTracks;

    @Column({ nullable: false, type: 'numeric', name: "chapter_id" })
    chapterId : number;

    @Column({ nullable: true, type: 'numeric', array: true, name: "hashtags_strapi_id" })
    hashtagsStrapiId : number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}