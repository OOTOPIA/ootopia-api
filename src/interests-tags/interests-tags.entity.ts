import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
} from 'typeorm';

enum TagType {
    Top = "top",
    Secondary = "secondary"
}
  
  
@Entity()
export class InterestsTags extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column({ nullable: false, type: 'varchar' })
    name : string;

    @Column({nullable: false, type: 'varchar'})
    type: TagType;

    @Column({ nullable : false, type: 'boolean', default: () => "false" })
    active : boolean;

    @Column({ nullable: false, name: 'tag_order', type: 'numeric', default: () => "1" })
    tagOrder : number;

    @Column({ nullable: false, type: 'varchar' })
    language : string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}