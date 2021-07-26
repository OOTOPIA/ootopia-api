import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
} from 'typeorm';
  
@Entity()
export class Badges extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column({ nullable: false, type: 'varchar' })
    icon : string;

    @Column({ nullable: false, type: 'varchar' })
    name : string; 

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}