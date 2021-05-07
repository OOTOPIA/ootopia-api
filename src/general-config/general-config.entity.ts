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