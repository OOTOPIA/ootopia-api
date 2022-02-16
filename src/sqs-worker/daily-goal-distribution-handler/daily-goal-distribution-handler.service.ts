import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from "@ssut/nestjs-sqs";
import { ConfigName } from 'src/general-config/general-config.entity';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { UsersService } from 'src/users/users.service';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';
import { UsersDeviceTokenService } from 'src/users-device-token/users-device-token.service';
import { getConnection } from 'typeorm';
import { WalletsService } from 'src/wallets/wallets.service';
import { Origin, WalletTransferAction, WalletTransfers } from 'src/wallet-transfers/wallet-transfers.entity';
import { NotificationMessagesService } from 'src/notification-messages/notification-messages.service';

@Injectable()
export class DailyGoalDistributionHandlerService {

    constructor(
        @Inject(forwardRef(() => UsersService)) private readonly usersService : UsersService,
        private readonly generalConfigService : GeneralConfigService,
        @Inject(forwardRef(() => WalletTransfersService)) private readonly walletTransfersService : WalletTransfersService,
        @Inject(forwardRef(() => UsersDeviceTokenService)) private readonly usersDeviceTokenService : UsersDeviceTokenService,
        @Inject(forwardRef(() => NotificationMessagesService)) private readonly notificationMessagesService : NotificationMessagesService,
        private readonly walletsService : WalletsService
    ) {}

    @SqsMessageHandler('daily_goal_distribution', false)
    public async handleMessage(message: AWS.SQS.Message) {
        try {

            let usersIds : string[] = (JSON.parse(message.Body)).usersIds;
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

        let globalGoalLimitTimeConfig = await this.generalConfigService.getConfig(ConfigName.GLOBAL_GOAL_LIMIT_TIME_IN_UTC);
        let dailyGoalStartTime = this.generalConfigService.getDailyGoalStartTime(globalGoalLimitTimeConfig.value);
        let dailyGoalEndTime = this.generalConfigService.getDailyGoalEndTime(globalGoalLimitTimeConfig.value);

        for (let i = 0; i < usersIds.length; i++) {
            let userId = usersIds[i];
            let userDailyGoalStats = await this.usersService.getUserDailyGoalStats(userId, dailyGoalStartTime, dailyGoalEndTime);
            
            await this.walletTransfersService.transferTodaysGameCompleted(userId, userDailyGoalStats.dailyGoalAchieved == false);
            let allTokensDevices = await this.usersDeviceTokenService.getByUserId(userId);
            let messagesNotification = allTokensDevices.map( device => (
                {
                    token: device.deviceToken,
                    data: {
                        type: 'regeneration-game',

                    }
                }
            ));
            if (messagesNotification.length) {
                await this.notificationMessagesService.sendFirebaseMessages(messagesNotification);
            }
        }

    }
}
