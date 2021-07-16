import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigName } from 'src/general-config/general-config.entity';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { PostsWatchedVideotimeService } from 'src/posts/services/posts-watched-videotime.service';
import { SqsWorkerService } from 'src/sqs-worker/sqs-worker.service';
import { PostsTimelineViewTimeService } from 'src/posts/services/posts-timeline-view-time.service';

@Injectable()
export class CronService {

    allUsersWatchedVideosIsLoading = false;
    allUsersWatchedVideosPage = 1;
    allUsersViewedTimelineIsLoading = false;
    allUsersViewedTimelinePage = 1;

    constructor(
        @Inject(forwardRef(() => GeneralConfigService)) private readonly generalConfigService : GeneralConfigService,
        @Inject(forwardRef(() => PostsWatchedVideotimeService)) private readonly postsWatchedVideotimeService : PostsWatchedVideotimeService,
        @Inject(forwardRef(() => PostsTimelineViewTimeService)) private readonly postsTimelineViewTimeService : PostsTimelineViewTimeService,
        @Inject(forwardRef(() => SqsWorkerService)) private readonly sqsWorkerService : SqsWorkerService,
    ){}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    //@Cron(CronExpression.EVERY_30_SECONDS)
    async cronDailyGoalDistribution() {

        try {

            this.allUsersWatchedVideosIsLoading = true;
            let allUsersIds = [];

            let globalGoalLimitTimeConfig = await this.generalConfigService.getConfig(ConfigName.GLOBAL_GOAL_LIMIT_TIME_IN_UTC);
            let dailyGoalStartTime = this.generalConfigService.getDailyGoalStartTime(globalGoalLimitTimeConfig.value);

            while(this.allUsersWatchedVideosIsLoading) {

                let usersIds = (await this.postsWatchedVideotimeService.getUsersIdsWhoWatchedVideosInThisPeriod(dailyGoalStartTime, this.allUsersWatchedVideosPage)).map((user) => user.userId);

                if (!usersIds || !usersIds.length) {
                    this.allUsersWatchedVideosIsLoading = false;
                    this.allUsersWatchedVideosPage = 1;
                    console.log("<<< end cronDailyGoalDistribution #1");
                    break;
                }

                usersIds.forEach((id) => {
                    if (allUsersIds.indexOf(id) == -1) {
                        allUsersIds.push(id);
                    }
                });

                this.allUsersWatchedVideosPage++;

            }

            while(this.allUsersViewedTimelineIsLoading) {

                let usersIds = (await this.postsTimelineViewTimeService.getUsersIdsWhoViewedTimelineInThisPeriod(dailyGoalStartTime, this.allUsersViewedTimelinePage)).map((user) => user.userId);

                if (!usersIds || !usersIds.length) {
                    this.allUsersViewedTimelineIsLoading = false;
                    this.allUsersViewedTimelinePage = 1;
                    console.log("<<< end cronDailyGoalDistribution #1");
                    break;
                }

                usersIds.forEach((id) => {
                    if (allUsersIds.indexOf(id) == -1) {
                        allUsersIds.push(id);
                    }
                });
                
                this.allUsersViewedTimelinePage++;

            }

            await this.sqsWorkerService.sendDailyGoalUsersIdsMessage({ usersIds : allUsersIds });

        }catch(err) {
            console.log('ERROR: cronDailyGoalDistribution >>>>', err);
        }

    }

}
