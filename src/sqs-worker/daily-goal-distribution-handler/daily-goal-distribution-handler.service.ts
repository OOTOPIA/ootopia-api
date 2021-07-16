import { Injectable } from '@nestjs/common';
import { SqsMessageHandler } from "@ssut/nestjs-sqs";
import { ConfigName } from 'src/general-config/general-config.entity';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { UsersService } from 'src/users/users.service';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';

@Injectable()
export class DailyGoalDistributionHandlerService {

    constructor(
        private readonly usersService : UsersService,
        private readonly generalConfigService : GeneralConfigService,
        private readonly walletTransfersService : WalletTransfersService,
        private readonly wallets : WalletTransfersService
    ) {}

    @SqsMessageHandler('daily_goal_distribution', false)
    public async handleMessage(message: AWS.SQS.Message) {
        try {

            let usersIds : string[] = (JSON.parse(message.Body)).usersIds;

            if (!usersIds.length) {
                console.log("Users ids is empty");
                return;
            }

            let globalGoalLimitTimeConfig = await this.generalConfigService.getConfig(ConfigName.GLOBAL_GOAL_LIMIT_TIME_IN_UTC);
            let dailyGoalStartTime = this.generalConfigService.getDailyGoalStartTime(globalGoalLimitTimeConfig.value);
            let dailyGoalEndTime = this.generalConfigService.getDailyGoalEndTime(globalGoalLimitTimeConfig.value);

            for (let i = 0; i < usersIds.length; i++) {
                let id = usersIds[i];
                let userDailyGoalStats = await this.usersService.getUserDailyGoalStats(id, dailyGoalStartTime, dailyGoalEndTime);

                if (userDailyGoalStats.dailyGoalAchieved) {
                    console.log("userDailyGoalStats", userDailyGoalStats);

                    let notProcessedTransfers = await this.walletTransfersService.getTransfersNotProcessedInThisPeriod(id, dailyGoalStartTime);

                    if (!notProcessedTransfers.length) {
                        continue;
                    }

                    let totalOOZToTransfer =  notProcessedTransfers.map((transfer) => +transfer.balance).reduce((total, value) => total + value);

                    console.log("total OOZ to send user", totalOOZToTransfer);
                    
                }



            }

        }catch(err) {
            console.log("SQS 'daily_goal_distribution' Error:", err);
        }
    }

}
