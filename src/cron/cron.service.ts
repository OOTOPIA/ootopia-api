import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigName } from 'src/general-config/general-config.entity';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import * as moment from 'moment-timezone';
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";

import * as _ from 'lodash';
import { PostsWatchedVideotimeService } from 'src/posts/services/posts-watched-videotime.service';
import { SqsWorkerService } from 'src/sqs-worker/sqs-worker.service';
import { PostsTimelineViewTimeService } from 'src/posts/services/posts-timeline-view-time.service';
import { UsersAppUsageTimeService } from 'src/users/services/users-app-usage-time/users-app-usage-time.service';
import { NotificationMessagesService } from 'src/notification-messages/notification-messages.service';
import * as Sentry from '@sentry/minimal';

@Injectable()
export class CronService {

    allUsersUsedAppIsLoading = false;
    allUsersUsedAppPage = 1;

    constructor(
        @Inject(forwardRef(() => NotificationMessagesService)) private notificationMessagesService  : NotificationMessagesService,
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

    @Cron(CronExpression.EVERY_DAY_AT_11AM)
    async cronPushNotificationComments() {
        let initDate = moment.utc(moment().toISOString()).subtract(1,'days').set({hours: 11, minutes: 0, seconds: 0, milliseconds: 0});
        let finishDate = moment.utc(moment().toISOString()).set({hours: 11, minutes: 0, seconds: 0, milliseconds: 0});

        try {
            let allComments = await getConnection().query(`
            select udt.device_token as "token", json_build_object('type','comments','typeId',p.id, 'photoURL', p.thumbnail_url , 'userId', u.id , 'userName', u.fullname) as "data" from posts_comments pc 
            left join users u on u.id = pc.user_id 
            left join posts p on p.id = pc.post_id
            left join users_device_token udt on udt.user_id = u.id::text
            where pc.created_at >= $1 and pc.created_at < $2 and pc.deleted is false and p.user_id != u.id and udt.device_token is not null;
            `,
            [ initDate.toISOString(), finishDate.toISOString()]);

            if(allComments.length) {
                await this.notificationMessagesService.sendFirebaseMessage(allComments);
            } 
        } catch(err) {
            this.captureExceptionSentry("push notification gratitude reward", err);
        }

    }

    @Cron(CronExpression.EVERY_DAY_AT_9PM)
    async cronPushNotificationRewards() {
        let initDate = moment.utc(moment().toISOString()).subtract(1,'days').set({hours: 21, minutes: 0, seconds: 0, milliseconds: 0});
        let finishDate = moment.utc(moment().toISOString()).set({hours: 21, minutes: 0, seconds: 0, milliseconds: 0});
        
        try {
            let allgratitudeReward = await getConnection().query(`
            select  udt.device_token as "token", json_build_object('type','gratitude_reward','typeId',p.id, 'photoURL', p.thumbnail_url , 'userId', ou.id , 'userName', ou.fullname, 'amounnt', wt.balance::text) as "data"  
            from wallet_transfers wt 
            left join users u on u.id = wt.user_id 
            left join users ou on ou.id = wt.other_user_id 
            left join posts p on p.id = wt.post_id 
            left join users_device_token udt on udt.user_id = u.id::text
            where 
                wt.created_at >= $1 and wt.created_at < $2 and 
                udt.device_token is not null and
                wt.origin = 'gratitude_reward' and
                wt."action" = 'received';
            `,
            [ initDate.toISOString(), finishDate.toISOString()]);
            
            if (allgratitudeReward.length) {
                await this.notificationMessagesService.sendFirebaseMessage(allgratitudeReward);
            }
        } catch(err) {
            this.captureExceptionSentry("push notification gratitude reward", err);
        }
    }

    captureExceptionSentry(initialMessage : string , error ) {
        console.log(initialMessage, error);
        Sentry.captureException(initialMessage, error);
    }

}
