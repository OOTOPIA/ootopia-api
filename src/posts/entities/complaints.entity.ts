import { PrimaryGeneratedColumn, Entity, BaseEntity, ManyToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Users } from '../../users/users.entity';
import { Posts } from '../posts.entity';
@Entity()
export class Complaints extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => Posts, post => post.id)
    @JoinColumn({ name: "post_id" })
    post: Posts;

    @Column({ type: 'varchar', name: "post_id"})
    postId: string;

    @ManyToOne(type => Users, user => user.id)
    @JoinColumn({ name: "user_id" })
    user: Users;

    @Column({ type: 'varchar', name: "user_id" })
    userId: string;

    @Column({ type: 'varchar', name: "denounced_id" })
    denouncedId: string;

    @ManyToOne(type => Users, user => user.id)
    @JoinColumn({ name: "denounced_id" })
    denounced: Users;

    @Column({ nullable: true, type: 'varchar' })
    reason: string;

    @Column({ nullable: true, type: 'boolean', name: 'visualizer_post_user' })
    visualizerPostUser: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}