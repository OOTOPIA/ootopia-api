import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { WalletsService } from '../wallets/wallets.service';
import { WalletTransferAction, Origin, WalletTransfers } from './wallet-transfers.entity';
import { WalletTransfersRepository } from './wallet-transfers.repository';
import { getConnection, In, QueryRunner } from 'typeorm';
import { PostsService } from 'src/posts/posts.service';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { ConfigName } from 'src/general-config/general-config.entity';
import { MarketPlaceProducts } from 'src/market-place/entities/market-place-products.entity';

@Injectable()
export class WalletTransfersService {

    constructor(
        private readonly walletTransfersRepository : WalletTransfersRepository, 
        private readonly walletsService : WalletsService,
        @Inject(forwardRef(() => PostsService))
        private readonly postsService : PostsService,
        private readonly generalConfigService : GeneralConfigService,
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
            fromPlatform : data.fromPlatform || false,
            processed : data.processed || false,
            postId : data.postId,
            marketPlaceData : data.marketPlaceData,
            description : data.description,
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
                processed : true,
            }, true));

            await queryRunner.manager.save(await this.createTransfer(receiverUserId, {
                userId : receiverUserId,
                otherUserId : senderUserId,
                walletId : receiverUserWalletId,
                origin: origin,
                action: WalletTransferAction.RECEIVED,
                balance : balance,
                postId : postId,
                processed : true,
            }, true));

            if (senderUserId != receiverUserId) {

                if (postId) {
                    await queryRunner.manager.save(await this.postsService.incrementOOZTotalCollected(balance, postId));
                }

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
        return await this.transferOOZBetweenUsers(userId, postAuthorId, balance, Origin.GRATITUDE_REWARD, postId);

    }

    async transferPersonalGoalAchieved(userId : string) {

        let queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            let globalGoalLimitTimeConfig = await this.generalConfigService.getConfig(ConfigName.GLOBAL_GOAL_LIMIT_TIME_IN_UTC);
            let dailyGoalStartTime = this.generalConfigService.getDailyGoalStartTime(globalGoalLimitTimeConfig.value);

            let receiverUserWalletId = (await this.walletsService.getWalletByUserId(userId)).id;

            let notProcessedTransfers = await this.getTransfersNotProcessedInThisPeriod(userId, dailyGoalStartTime);
            let balances = notProcessedTransfers.map((transfer) => +transfer.balance);

            if (balances.length <= 0) {
                return;
            }

            let balance = balances.reduce((total, value) => total + value);

            if (balance <= 0) {
                return;
            }

            await queryRunner.manager.save(await this.createTransfer(userId, {
                userId : userId,
                walletId : receiverUserWalletId,
                balance : +balance,
                origin : Origin.PERSONAL_GOAL_ACHIEVED,
                action : WalletTransferAction.RECEIVED,
                fromPlatform : true,
                processed : true
            }, true));

            await queryRunner.manager.update(WalletTransfers, {
                id: In(notProcessedTransfers.map((transfer) => transfer.id))
            }, { removed : true});

            await queryRunner.manager.save(await this.walletsService.increaseTotalBalance(receiverUserWalletId, userId, +balance));

            await queryRunner.commitTransaction();

        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }

    }

    async transferTodaysGameCompleted(userId : string) {

        let queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            let globalGoalLimitTimeConfig = await this.generalConfigService.getConfig(ConfigName.GLOBAL_GOAL_LIMIT_TIME_IN_UTC);
            let dailyGoalStartTime = this.generalConfigService.getDailyGoalStartTime(globalGoalLimitTimeConfig.value);

            let receiverUserWalletId = (await this.walletsService.getWalletByUserId(userId)).id;

            let notProcessedTransfers = await this.getTransfersNotProcessedInThisPeriod(userId, dailyGoalStartTime);
            let balances = notProcessedTransfers.map((transfer) => +transfer.balance);

            if (balances.length <= 0) {
                return;
            }

            let balance = balances.reduce((total, value) => total + value);

            if (balance <= 0) {
                return;
            }

            await queryRunner.manager.save(await this.createTransfer(userId, {
                userId : userId,
                walletId : receiverUserWalletId,
                balance : +balance,
                origin : Origin.TOTAL_GAME_COMPLETED,
                action : WalletTransferAction.RECEIVED,
                fromPlatform : true,
                processed : true
            }, true));

            await queryRunner.manager.update(WalletTransfers, {
                id: In(notProcessedTransfers.map((transfer) => transfer.id))
            }, { removed : true});

            await queryRunner.manager.save(await this.walletsService.increaseTotalBalance(receiverUserWalletId, userId, +balance));

            await queryRunner.commitTransaction();

        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }

    }

    async getTransfers(filters) {
        if (filters.userId) {
            filters.walletId = (await this.walletsService.getWalletByUserId(filters.userId)).id
        }
        return (await this.walletTransfersRepository.getTransfers(filters)).map((transfer) => {
            transfer.balance = ((+transfer.balance).toFixed(2));
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

    async getUserOOZAccumulatedInThisPeriod(userId : string, processed : boolean, startDateTime : Date) {
        let result = await this.walletTransfersRepository.getUserOOZAccumulatedInThisPeriod(userId, processed, startDateTime);
        return (result.length ? +result[0].sum : 0);
    }

    async getTransfersNotProcessedInThisPeriod(userId : string, startDateTime : Date) {
        return await this.walletTransfersRepository.getTransfersNotProcessedInThisPeriod(userId, startDateTime);
    }

    async transferMarketPlacePurchase(userId : string, marketPlaceProduct : MarketPlaceProducts) {

        let userWallet = await this.walletsService.getWalletByUserId(userId);

        if ((+userWallet.totalBalance - +marketPlaceProduct.price) < 0) {
            throw new HttpException("INSUFFICIENT_BALANCE", 400);
        }

        let queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            await queryRunner.manager.save(await this.createTransfer(userId, {
                userId : userId,
                walletId : userWallet.id,
                balance : +marketPlaceProduct.price,
                origin : Origin.MARKET_PLACE_TRANSFER,
                action : WalletTransferAction.SENT,
                marketPlaceData : marketPlaceProduct,
                description : marketPlaceProduct.title,
                fromPlatform : true,
                processed : true
            }, true));

            await queryRunner.manager.save(await this.walletsService.increaseTotalBalance(userWallet.id, userId, +marketPlaceProduct.price));

            await queryRunner.commitTransaction();

        }catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }

    }

}
