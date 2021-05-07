import { Injectable } from '@nestjs/common';
import { WalletsService } from '../wallets/wallets.service';
import { WalletTransfersRepository } from './wallet-transfers.repository';

@Injectable()
export class WalletTransfersService {

    constructor(private readonly walletTransfersRepository : WalletTransfersRepository, private readonly walletsService : WalletsService) {}

    async createTransfer(userId : String, balance : number) {
        let wallet = await this.walletsService.getWalletByUserId(userId);
        //temporário porque há contas sem wallet
        //TODO: trocar a condição para uma exceção caso não encontre a wallet
        if (!wallet) {
            wallet = await this.walletsService.createOrUpdateWallet({
                userId : userId
            });
        }
        let walletTransfer = await this.walletTransfersRepository.createTransfer({
            walletId : wallet.id,
            userId : userId,
            balance : balance,
        });

        await this.walletsService.recalculateTotalBalance(wallet.id, userId);

        return walletTransfer;
    }

}
