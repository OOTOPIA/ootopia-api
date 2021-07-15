import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigName } from 'src/general-config/general-config.entity';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { PostsWatchedVideotimeService } from 'src/posts/services/posts-watched-videotime.service';
import { SqsWorkerService } from 'src/sqs-worker/sqs-worker.service';

@Injectable()
export class CronService {

    allUsersIsLoading = false;
    allUsersPage = 1;

    constructor(
        @Inject(forwardRef(() => GeneralConfigService)) private readonly generalConfigService : GeneralConfigService,
        @Inject(forwardRef(() => PostsWatchedVideotimeService)) private readonly postsWatchedVideotimeService : PostsWatchedVideotimeService,
        @Inject(forwardRef(() => SqsWorkerService)) private readonly sqsWorkerService : SqsWorkerService,
    ){}

//sendDailyGoalUsersIdsMessage

    //@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    @Cron(CronExpression.EVERY_30_SECONDS)
    async cronDailyGoalDistribution() {

        try {

            this.allUsersIsLoading = true;

            while(this.allUsersIsLoading) {
        
                let globalGoalLimitTimeConfig = await this.generalConfigService.getConfig(ConfigName.GLOBAL_GOAL_LIMIT_TIME_IN_UTC);
                let dailyGoalStartTime = this.getDailyGoalStartTime(globalGoalLimitTimeConfig.value);

                console.log("dailyGoalStartTime", dailyGoalStartTime);

                let usersIds = (await this.postsWatchedVideotimeService.getUsersIdsWhoWatchedVideosInThisPeriod(dailyGoalStartTime, this.allUsersPage)).map((user) => user.userId);

                if (!usersIds || !usersIds.length) {
                    this.allUsersIsLoading = false;
                    this.allUsersPage = 1;
                    console.log("<<< end cronDailyGoalDistribution");
                    break;
                }

                await this.sqsWorkerService.sendDailyGoalUsersIdsMessage(usersIds);

                //send message!!
                console.log("send message to worker with usersIds");

                this.allUsersPage++;

                console.log('usersIds', usersIds);

            }

        }catch(err) {
            console.log('err >>>>', err);
        }

    }

    getDailyGoalStartTime(_time : string) {
        let date = moment.utc(), time = moment.utc(_time, "HH:mm:ss");
        let dateCopy = _.cloneDeep(date, true);
        return moment.utc(dateCopy.set({
            hour:   time.get('hour'),
            minute: time.get('minute'),
            second: time.get('second')
        }).subtract(1, 'day')).toDate();
    }

}
