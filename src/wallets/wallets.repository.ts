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

    async recalculateTotalBalance(walletId : string, userId : String) {

        let result = await getConnection().query(`
            UPDATE wallets SET total_balance = COALESCE((select sum(balance) from wallet_transfers where wallet_id = $1 group by wallet_id), 0), updated_at = now()
            WHERE id = $1 and user_id = $2
            RETURNING *;
        `, [
            walletId,
            userId
        ]);

        return result.length ? result[0] : null;

    }

}