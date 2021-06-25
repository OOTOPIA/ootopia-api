import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { WalletsService } from '../wallets/wallets.service';
import { WalletTransferAction, Origin, WalletTransfers } from './wallet-transfers.entity';
import { WalletTransfersRepository } from './wallet-transfers.repository';
import { getConnection, QueryRunner } from 'typeorm';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class WalletTransfersService {

    constructor(
        private readonly walletTransfersRepository : WalletTransfersRepository, 
        private readonly walletsService : WalletsService,
        @Inject(forwardRef(() => PostsService))
        private readonly postsService : PostsService
    ) {}

    //Esse método deveria ser privado, porém está exposto porque temos um endpoint para dar aumentar o valor da carteira do usuário manualmente

    async createTransfer(userId, data, isTransaction? : boolean) {

        let walletId = data.walletId ? data.walletId : (await this.walletsService.getWalletByUserId(userId)).id;

        let walletTransfer = await this.walletTransfersRepository.createTransfer({
            userId : userId,
            walletId : walletId,
            otherUserId : data.otherUserId,
            balance : +((+data.balance).toFixed(2)),
            origin : data.origin,
            action : data.action,
            fromPlatform : data.fromPlatform || false
        }, isTransaction);

        if (!isTransaction) {
            await this.walletsService.increaseTotalBalance(walletId, userId, data.balance);
        }

        return walletTransfer;

    }

    private async transferOOZBetweenUsers(senderUserId : string, receiverUserId : string, balance : number, origin : Origin, postId? : string, queryRunner? : QueryRunner) {

        if (!queryRunner) {
            queryRunner = getConnection().createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        let senderUserWalletId = (await this.walletsService.getWalletByUserId(senderUserId)).id;
        let receiverUserWalletId = (await this.walletsService.getWalletByUserId(receiverUserId)).id;

        try {

            await queryRunner.manager.save(await this.createTransfer(senderUserId, {
                userId : senderUserId,
                otherUserId : receiverUserId,
                walletId : senderUserWalletId,
                origin: origin,
                action: WalletTransferAction.SENT,
                balance : balance,
                postId : postId,
            }, true));

            await queryRunner.manager.save(await this.createTransfer(receiverUserId, {
                userId : receiverUserId,
                otherUserId : senderUserId,
                walletId : receiverUserWalletId,
                origin: origin,
                action: WalletTransferAction.RECEIVED,
                balance : balance,
                postId : postId,
            }, true));

            if (postId) {
                await queryRunner.manager.save(await this.postsService.incrementOOZTotalCollected(balance, postId));
            }

            if (senderUserId != receiverUserId) {

                await queryRunner.manager.save(await this.walletsService.decreaseTotalBalance(senderUserWalletId, senderUserId, balance));
                await queryRunner.manager.save(await this.walletsService.increaseTotalBalance(receiverUserWalletId, receiverUserId, balance));

            }

            await queryRunner.commitTransaction();

        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
    }

    async transferToPostAuthor(userId : string, postId : string, balance : number) {

        let userWallet = await this.walletsService.getWalletByUserId(userId);

        if ((+userWallet.totalBalance - +balance) < 0) {
            throw new HttpException("INSUFFICIENT_BALANCE", 400);
        }

        let postAuthorId : any = (await this.postsService.getPostById(postId)).userId;
        return await this.transferOOZBetweenUsers(userId, postAuthorId, balance, Origin.VIDEO_LIKE, postId);

    }

    async getTransfers(filters) {
        return (await this.walletTransfersRepository.getTransfers(filters)).map((transfer) => {
            transfer.balance = +((+transfer.balance).toFixed(2));
            return transfer;
        });
    }

    async createTransferTest(userId : string) {
        let queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
                let transfer = await this.createTransfer(userId, { balance : 50, origin : Origin.TRANSFER, action: WalletTransferAction.RECEIVED }, true);
                await queryRunner.manager.save(transfer);
                let walletId = (await this.walletsService.getWalletByUserId(userId)).id;
                await queryRunner.manager.save(await this.walletsService.increaseTotalBalance(walletId, userId, 50));
                await queryRunner.commitTransaction();
                return transfer;
        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
    }

}
