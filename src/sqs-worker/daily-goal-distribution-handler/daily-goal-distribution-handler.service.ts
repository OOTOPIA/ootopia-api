import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from "@ssut/nestjs-sqs";
import { ConfigName } from 'src/general-config/general-config.entity';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { UsersService } from 'src/users/users.service';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';
import { getConnection } from 'typeorm';
import { WalletsService } from 'src/wallets/wallets.service';
import { Origin, WalletTransferAction, WalletTransfers } from 'src/wallet-transfers/wallet-transfers.entity';

@Injectable()
export class DailyGoalDistributionHandlerService {

    constructor(
        @Inject(forwardRef(() => UsersService)) private readonly usersService : UsersService,
        private readonly generalConfigService : GeneralConfigService,
        @Inject(forwardRef(() => WalletTransfersService)) private readonly walletTransfersService : WalletTransfersService,
        private readonly walletsService : WalletsService
    ) {}

    @SqsMessageHandler('daily_goal_distribution', false)
    public async handleMessage(message: AWS.SQS.Message) {
        try {

            let usersIds : string[] = (JSON.parse(message.Body)).usersIds;
            console.log('new message');

            this.startCheckingUsersDailyGoal(usersIds);

        }catch(err) {
            console.log("SQS 'daily_goal_distribution' Error:", err);
            throw err;
        }
    }

    async startCheckingUsersDailyGoal(usersIds : string[]) {

        if (!usersIds.length) {
            console.log("Users ids is empty");
            return;
        }

        console.log('usersIds >>>', usersIds);

        let globalGoalLimitTimeConfig = await this.generalConfigService.getConfig(ConfigName.GLOBAL_GOAL_LIMIT_TIME_IN_UTC);
        let dailyGoalStartTime = this.generalConfigService.getDailyGoalStartTime(globalGoalLimitTimeConfig.value);
        let dailyGoalEndTime = this.generalConfigService.getDailyGoalEndTime(globalGoalLimitTimeConfig.value);

        for (let i = 0; i < usersIds.length; i++) {
            let id = usersIds[i];
            let userDailyGoalStats = await this.usersService.getUserDailyGoalStats(id, dailyGoalStartTime, dailyGoalEndTime);

            if (userDailyGoalStats.dailyGoalAchieved) {

                let notProcessedTransfers = await this.walletTransfersService.getTransfersNotProcessedInThisPeriod(id, dailyGoalStartTime);

                if (!notProcessedTransfers.length) {
                    continue;
                }

                let transfersGroupedByOrigin = {};

                notProcessedTransfers.forEach((transfer) => {
                    if (!transfersGroupedByOrigin[transfer.origin]) {
                        transfersGroupedByOrigin[transfer.origin] = {totalOOZToTransfer : 0, transfers: []};
                    }
                    transfersGroupedByOrigin[transfer.origin]['transfers'].push(transfer);
                });

                for (let i = 0; i < Object.keys(transfersGroupedByOrigin).length; i++) {
                    let origin = Object.keys(transfersGroupedByOrigin)[i];
                    let transfersGroup = transfersGroupedByOrigin[origin];
                    transfersGroup['totalOOZToTransfer'] = (+notProcessedTransfers.filter((transfer) => transfer.origin == origin).map((transfer) => +transfer.balance).reduce((total, value) => total + value)).toFixed(2)
                }

                await this.performUserTransfers(id, transfersGroupedByOrigin, notProcessedTransfers.map((transfer) => transfer.id));
                
            }else{
                console.log("not daily goal achieved >>>", userDailyGoalStats);
            }

        }

    }

    private async performUserTransfers(userId, transfersGroupedByOrigin, notProcessedTransfersIds) {

        let queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let totalOOZToTransfer = 0;

        try {

            let receiverUserWalletId = (await this.walletsService.getWalletByUserId(userId)).id;

            for (let i = 0; i < Object.keys(transfersGroupedByOrigin).length; i++) {
                let origin = Object.keys(transfersGroupedByOrigin)[i];
                let transfersGroup = transfersGroupedByOrigin[origin];
                
                if (transfersGroup.totalOOZToTransfer > 0) {

                    await queryRunner.manager.save(await this.walletTransfersService.createTransfer(userId, {
                        userId : userId,
                        walletId : receiverUserWalletId,
                        balance : +transfersGroup.totalOOZToTransfer,
                        origin : origin,
                        action : WalletTransferAction.RECEIVED,
                        fromPlatform : true,
                        processed : true
                    }, true));

                    totalOOZToTransfer = totalOOZToTransfer + +transfersGroup.totalOOZToTransfer;

                }

            }

            await queryRunner.manager.save(await this.walletsService.increaseTotalBalance(receiverUserWalletId, userId, +totalOOZToTransfer));

            for (let i = 0; i < notProcessedTransfersIds.length; i++) {
                let transferId = notProcessedTransfersIds[i];
                await queryRunner.manager.update(WalletTransfers, transferId, { removed : true });
            }

            await queryRunner.commitTransaction();

        }catch(err) {
            console.log("Error when transfer to user", err);
            await queryRunner.rollbackTransaction();
            throw err;
        }


    }

}
