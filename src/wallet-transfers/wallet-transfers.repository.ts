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

    createTransfer(walletTransferData) {
        const walletTransfer = this.create();
        Object.assign(walletTransfer, walletTransferData);
        return this.save(walletTransfer);
    }

}