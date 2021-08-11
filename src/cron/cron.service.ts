import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigName } from 'src/general-config/general-config.entity';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { PostsWatchedVideotimeService } from 'src/posts/services/posts-watched-videotime.service';
import { SqsWorkerService } from 'src/sqs-worker/sqs-worker.service';
import { PostsTimelineViewTimeService } from 'src/posts/services/posts-timeline-view-time.service';
import { UsersAppUsageTimeService } from 'src/users/services/users-app-usage-time/users-app-usage-time.service';

@Injectable()
export class CronService {

    allUsersUsedAppIsLoading = false;
    allUsersUsedAppPage = 1;

    constructor(
        @Inject(forwardRef(() => GeneralConfigService)) private readonly generalConfigService : GeneralConfigService,
        @Inject(forwardRef(() => UsersAppUsageTimeService)) private readonly usersAppUsageTimeService : UsersAppUsageTimeService,
        @Inject(forwardRef(() => SqsWorkerService)) private readonly sqsWorkerService : SqsWorkerService,
    ){}

    @Cron(CronExpression.EVERY_DAY_AT_11PM)
    async cronDailyGoalDistribution() {

        try {

            this.allUsersUsedAppIsLoading = true;
            let allUsersIds = [];

            let globalGoalLimitTimeConfig = await this.generalConfigService.getConfig(ConfigName.GLOBAL_GOAL_LIMIT_TIME_IN_UTC);
            let dailyGoalStartTime = this.generalConfigService.getDailyGoalStartTime(globalGoalLimitTimeConfig.value);

            while(this.allUsersUsedAppIsLoading) {

                let usersIds = (await this.usersAppUsageTimeService.getUsersIdsWhoUsedAppInThisPeriod(dailyGoalStartTime, this.allUsersUsedAppPage)).map((user) => user.userId);

                if (!usersIds || !usersIds.length) {
                    this.allUsersUsedAppIsLoading = false;
                    this.allUsersUsedAppPage = 1;
                    console.log("<<< end cronDailyGoalDistribution #1");
                    break;
                }

                usersIds.forEach((id) => {
                    if (allUsersIds.indexOf(id) == -1) {
                        allUsersIds.push(id);
                    }
                });

                this.allUsersUsedAppPage++;

            }

            await this.sqsWorkerService.sendDailyGoalUsersIdsMessage({ usersIds : allUsersIds });

        }catch(err) {
            console.log('ERROR: cronDailyGoalDistribution >>>>', err);
        }

    }

}
