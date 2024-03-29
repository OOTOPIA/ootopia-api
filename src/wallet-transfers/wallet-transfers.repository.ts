import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { Origin, WalletTransfers } from "./wallet-transfers.entity";
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

    updateTransfer(walletTransferId : string, walletTransferData, isTransaction? : boolean) {
        const walletTransfer = this.create();
        Object.assign(walletTransfer, walletTransferData);
        walletTransfer.id = walletTransferId;
        if (!isTransaction) {
            return this.save(walletTransfer);
        }
        return walletTransfer;
    }

    async getTransfers(filters) {

        if (!filters.walletId) {
            throw new HttpException("Mandatory field 'walletId' is not found", 400);
        }

        let where = "w.processed = true AND w.removed = false AND ", params = [];
        let perPage = 10, limit = 'LIMIT ' + perPage;
        let columns = [
            'w.id', 'w.user_id', 'w.wallet_id', 'w.other_user_id', 'w.post_id', 'w.origin', 'w.action', 'w.balance', 'w.from_platform', 'w.created_at', 'w.updated_at',
            'w.description', 'w.market_place_data', 'w.learning_track_id',
            'users.photo_url', 'users.fullname as other_username', 
            `(
                CASE 
                    when posts.thumbnail_url is not null
                        then posts.thumbnail_url
                        else (select m.thumbnail_url from medias m where m.id = any(posts.media_ids) limit 1)
                    end
            ) as icon`, 'learning_tracks.image_url as l_image_url'
        ];

        params.push(filters.walletId);
        where = where + `w.wallet_id = $${params.length} AND `;

        if (filters.action) {
            params.push(filters.action);
            where = where + `w.action = $${params.length} AND `;
        }

        if (filters.learningTrackId) {
            params.push(filters.learningTrackId);
            where = where + `w.learning_track_id = $${params.length} AND ((w.created_at::date) = (now()::date)) AND `;
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
            LEFT JOIN posts ON posts.id = w.post_id
            LEFT JOIN learning_tracks ON learning_tracks.id = w.learning_track_id
            WHERE ${where}
            ORDER BY w.created_at DESC
            ${limit}
        `, params), { deep : true }).map(this.mapper);

    }

    mapper(transfer) {
        if (transfer.origin == Origin.TOTAL_GAME_COMPLETED || transfer.origin == Origin.PERSONAL_GOAL_ACHIEVED || transfer.origin == Origin.INVITATION_CODE_SENT || transfer.origin == Origin.INVITATION_CODE_ACCEPTED) {
            transfer.icon = "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/transfer_ooz.svg";
        }
        if (transfer.origin == Origin.LEARNING_TRACK) {
            transfer.photoUrl = "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/compass.png";
            if (!transfer.otherUsername) {
                transfer.otherUsername = "Ootopia";
            }
        }
        if (transfer.origin == Origin.MARKET_PLACE_TRANSFER) {
            let marketPlaceData = JSON.parse(transfer.marketPlaceData);
            if (marketPlaceData) {
                transfer.icon = marketPlaceData.imageUrl;
                transfer.photoUrl = "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_marketplace_icon.png";
                transfer.otherUsername = marketPlaceData.userName;
            }

        }
        return transfer;
    }

    async getUserOOZAccumulatedInThisPeriod(userId : string, processed : boolean, startDateTime : Date) {
        return camelcaseKeys(await getConnection().query(`
            SELECT sum(balance) FROM wallet_transfers w 
            WHERE user_id = $1 AND processed = $2 AND created_at BETWEEN $3 and now() at time zone 'UTC' AND removed = false;
        `, [userId, processed, startDateTime]), { deep : true });
    }

    async getTransfersNotProcessedInThisPeriod(userId : string, startDateTime : Date) {
        return camelcaseKeys(await getConnection().query(`
            SELECT * FROM wallet_transfers w 
            WHERE user_id = $1 AND processed = false AND created_at BETWEEN $2 and now() at time zone 'UTC' AND removed = false;
        `, [userId, startDateTime]), { deep : true });
    }

}