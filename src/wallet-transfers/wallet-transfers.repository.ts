import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { WalletTransfers } from "./wallet-transfers.entity";
import * as camelcaseKeys from 'camelcase-keys';

@Injectable()
@EntityRepository(WalletTransfers)
export class WalletTransfersRepository extends Repository<WalletTransfers>{

    constructor() {
        super();
    }

    createTransfer(walletTransferData, isTransaction? : boolean) {
        const walletTransfer = this.create();
        Object.assign(walletTransfer, walletTransferData);
        if (!isTransaction) {
            return this.save(walletTransfer);
        }
        return walletTransfer;
    }

    async getTransfers(filters) {

        if (!filters.userId) {
            throw new HttpException("Mandatory field 'userId' is not found", 400);
        }

        let where = "", params = [];
        let perPage = 10, limit = 'LIMIT ' + perPage;
        let columns = [
            'w.id', 'w.user_id', 'w.wallet_id', 'w.other_user_id', 'w.post_id', 'w.origin', 'w.action', 'w.balance', 'w.created_at', 'w.updated_at',
            'users.photo_url', 'users.fullname as other_username',
        ];

        params.push(filters.userId);
        where = where + `(w.user_id = $${params.length} OR w.other_user_id = $${params.length}) AND `;

        if (filters.action) {
            params.push(filters.action);
            where = where + `w.action = $${params.length} AND `;
        }

        if (filters.limit && filters.offset) {
            if (filters.limit > 50) {
                filters.limit = 50;
            }
            limit = 'LIMIT ' + filters.limit + ' OFFSET ' + filters.offset;
        }

        where = where.substring(0, where.length - 5);

        return camelcaseKeys(await getConnection().query(`
            SELECT ${columns} FROM wallet_transfers w
            LEFT JOIN users ON users.id = w.other_user_id
            WHERE ${where}
            ORDER BY w.created_at DESC
            ${limit}
        `, params), { deep : true });

    }

}