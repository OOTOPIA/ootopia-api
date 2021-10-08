import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
} from 'typeorm';

@Entity()
export class MarketPlaceProducts extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column({ nullable: false, type: 'numeric', name : "strapi_id" })
    strapiId : number;

    @Column({ nullable: true, type: 'varchar', name: "user_id", })
    userId? : string;

    @Column({ nullable: true, type: 'varchar' })
    title : string;

    @Column({ nullable: true, type: 'varchar' })
    description : string;

    @Column({ nullable: true, type: 'varchar' })
    locale : string;

    @Column({ nullable: true, type: 'varchar', name : 'image_url' })
    imageUrl : string;

    @Column({ nullable: true, type: 'timestamptz', name : 'image_updated_at' })
    imageUpdatedAt : string;

    @Column({ nullable: true, type: 'numeric' })
    price : number;

    @Column({ nullable: true, type: 'varchar' })
    location : string;

    @Column({nullable : true, name: 'deleted_at', type: 'timestamp'})
    deletedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}