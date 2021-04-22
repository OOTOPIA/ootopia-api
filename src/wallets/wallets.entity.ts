
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

import { Users } from '../users/users.entity';

@Entity()
export class Wallets extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id : string;

  @OneToOne(type => Users, user => user.id)
  @JoinColumn({ name: "user_id" })
  userId : Users;

  @Column({ nullable : false, name: "total_balance", type: 'numeric', default: () => "0"})
  totalBalance : number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
