import { Cities } from 'src/cities/cities.entity';
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
  
@Entity()
export class Addresses extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id : string;

    @Column({ nullable: false, type: 'numeric' })
    lat : number;

    @Column({ nullable: false, type: 'numeric' })
    lng : number;

    @Column({ nullable: true, type: 'numeric' })
    number : number;

    @Column({ nullable: true, type: 'varchar' })
    complement : string;

    @ManyToOne(type => Cities, city => city.id)
    @JoinColumn({ name : "city_id" })
    city : Cities;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}