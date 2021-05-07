import { Injectable } from '@nestjs/common';
import { WalletsRepository } from './wallets.repository';

@Injectable()
export class WalletsService {
    constructor(private readonly walletsRepository : WalletsRepository) {}

    async createOrUpdateWallet(walletData) {
        return await this.walletsRepository.createOrUpdateWallet(walletData);
    }

    async getWalletByUserId(userId) {
        return await this.walletsRepository.getWalletByUserId(userId);
    }

    async recalculateTotalBalance(walletId, userId) {
        return await this.walletsRepository.recalculateTotalBalance(walletId, userId);
    }

}
