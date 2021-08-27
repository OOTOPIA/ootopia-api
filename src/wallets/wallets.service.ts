import { Injectable } from '@nestjs/common';
import { WalletsRepository } from './wallets.repository';

@Injectable()
export class WalletsService {
    constructor(private readonly walletsRepository : WalletsRepository) {}

    async createOrUpdateWallet(walletData) {
        return await this.walletsRepository.createOrUpdateWallet(walletData);
    }

    async delete(id) {
        return await this.walletsRepository.delete(id);
    }

    async getWalletByUserId(userId) {
        return await this.walletsRepository.getWalletByUserId(userId);
    }

    /*async recalculateTotalBalance(walletId, userId) {
        return await this.walletsRepository.recalculateTotalBalance(walletId, userId);
    }*/

    async increaseTotalBalance(walletId, userId, balance) {
        return await this.walletsRepository.increaseTotalBalance(walletId, userId, balance);
    }

    async decreaseTotalBalance(walletId, userId, balance) {
        return await this.walletsRepository.decreaseTotalBalance(walletId, userId, balance);
    }

}
