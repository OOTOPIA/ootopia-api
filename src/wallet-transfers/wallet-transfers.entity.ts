
import { Wallets } from 'src/wallets/wallets.entity';
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
export class WalletTransfers extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id : string;

  @ManyToOne(type => Users, user => user.id)
  @JoinColumn({ name: "user_id" })
  userId : Users;

  @ManyToOne(type => Wallets, wallet => wallet.id)
  @JoinColumn({ name: "wallet_id" })
  walletId : Wallets;

  @Column({ nullable : false, type: 'numeric', default: () => "0"})
  balance : number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
