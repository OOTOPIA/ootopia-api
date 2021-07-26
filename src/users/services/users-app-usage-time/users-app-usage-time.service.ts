import { HttpException, Injectable } from '@nestjs/common';
import { ConfigName } from 'src/general-config/general-config.entity';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { UsersAppUsageTimeRepository } from 'src/users/repositories/users-app-usage-time.repository';
import { Origin, WalletTransferAction } from 'src/wallet-transfers/wallet-transfers.entity';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { getConnection } from 'typeorm';

@Injectable()
export class UsersAppUsageTimeService {

    constructor(
        private readonly usersAppUsageTimeRepository : UsersAppUsageTimeRepository,
        ) {

    }
    
    async recordAppUsageTime(data) {

        if (!data || !data.timeInMilliseconds || !data.userId) {
            throw new HttpException('Mandatory data not found', 400);
        }

        await this.usersAppUsageTimeRepository.recordAppUsageTime(data);
        
    }

    async getUsersIdsWhoUsedAppInThisPeriod(startDateTime : Date, page : number) {
        return await this.usersAppUsageTimeRepository.getUsersIdsWhoUsedAppInThisPeriod(startDateTime, page);
    }

    async getTimeSumOfUserUsedAppInThisPeriod(userId : string, startDateTime : Date) : Promise<number> {
        let result = await this.usersAppUsageTimeRepository.getTimeSumOfUserUsedAppInThisPeriod(userId, startDateTime)
        return result.length ? +result[0].sum : 0;
    }

}
