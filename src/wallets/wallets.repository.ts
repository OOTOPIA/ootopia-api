import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { Wallets } from "./wallets.entity";
import * as camelcaseKeys from 'camelcase-keys';

@Injectable()
@EntityRepository(Wallets)
export class WalletsRepository extends Repository<Wallets>{

    constructor() {
        super();
    }

    createOrUpdateWallet(walletData) {
        const wallet = this.create();
        Object.assign(wallet, walletData);
        return this.save(wallet);
    }

    async getWalletByUserId(userId) {
        let results = camelcaseKeys(await getConnection().query(`
            SELECT 
                w.*
            FROM wallets w
            WHERE w.user_id = $1
        `, [userId]), { deep : true });

        return results.length ? results[0] : null;
    }

    // This method is no longer used, and if it is necessary to use it in the future, the change that considers the ACTION field must be made to determine the total balance.

    /*async recalculateTotalBalance(walletId : string, userId : String) {

        let result = await getConnection().query(`
            UPDATE wallets SET total_balance = COALESCE((select sum(balance) from wallet_transfers where wallet_id = $1 group by wallet_id), 0), updated_at = now()
            WHERE id = $1 and user_id = $2
            RETURNING *;
        `, [
            walletId,
            userId
        ]);

        return result.length ? result[0] : null;

    }*/

    async increaseTotalBalance(walletId : string, userId : String, balance : number) {
        const wallet = await this.findOne({
            where: {
                id : walletId,
                userId : userId
            },
        });
        wallet.totalBalance = +(+wallet.totalBalance + +balance).toFixed(2);
        return wallet;
    }

    async decreaseTotalBalance(walletId : string, userId : String, balance : number) {
        const wallet = await this.findOne({
            where: {
                id : walletId,
                userId : userId
            },
        });
        if (wallet.totalBalance - balance >= 0) {
            wallet.totalBalance = +(+wallet.totalBalance - +balance).toFixed(2);
        }else{
            wallet.totalBalance = 0;
        }
        return wallet;
    }

}