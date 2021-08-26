import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
} from 'typeorm';
  
enum BadgeType {
    sower = 'sower',
} 

@Entity()
export class Badges extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column({ nullable: false, type: 'varchar' })
    icon : string;

    @Column({ nullable: false, type: 'varchar' })
    name : string; 

    @Column({ nullable: true, type: 'enum', enum: BadgeType })
    type : string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}