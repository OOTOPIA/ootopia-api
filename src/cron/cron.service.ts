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

    @Cron(CronExpression.EVERY_DAY_AT_5PM)
    async cronPushNotificationComments() {        
        let startDate = moment.utc().subtract(1,'days').set({hours: 17, minutes: 0, seconds: 0, milliseconds: 0});
        let endDate = moment.utc().set({hours: 17, minutes: 0, seconds: 0, milliseconds: 0});
        let allPost = [];
        let allPostGroupByPost = [];
        let pagination = {
            offset: 0,
            limit: 50,
            finished: false,
        };

        try {
            while (!pagination.finished) {
                let comments = await getConnection().query(`
                select udt.device_token as "token", json_build_object('type','comments', 'postId', p.id, 'photoURL', p.thumbnail_url,'usersName', array_to_json(array_agg(DISTINCT u.fullname))) as "data"
                from posts_comments pc
                inner join posts p on p.id = pc.post_id 
                inner join users u on u.id = pc.user_id
                inner join users_device_token udt on udt.user_id = p.user_id::text
                where pc.created_at >= $1 and pc.created_at < $2 and pc.deleted is false and p.user_id != u.id and udt.device_token is not null
                group by p.id, udt.device_token order by min(pc.created_at) asc offset $3 limit $4;
                `,
                [ startDate.toISOString(), endDate.toISOString(), pagination.offset, pagination.limit]);
                
                if (!comments || !comments.length) {
                    pagination.finished = true;
                } else {
                    allPost = allPost.concat(comments);
                    pagination.offset = allPost.length;
                }
            }

            allPostGroupByPost = this.groupByNotificationsByPostId(allPost);

            if(allPostGroupByPost.length) {
                await this.notificationMessagesService.sendFirebaseMessages(allPostGroupByPost);
            }
        } catch(err) {
            this.captureExceptionSentry("push notification comments", err);
        }

    }

    @Cron(CronExpression.EVERY_DAY_AT_9PM)
    async cronPushNotificationRewards() {
        let startDate = moment.utc().subtract(1,'days').set({hours: 21, minutes: 0, seconds: 0, milliseconds: 0});
        let endDate = moment.utc().set({hours: 21, minutes: 0, seconds: 0, milliseconds: 0});
        let allGratitudeReward = [];
        let allGratitudeRewardGroupedByPost = [];
        let pagination = {
            offset: 0,
            limit: 50,
            finished: false,
        };
        
        try {
            while (!pagination.finished) {
                let gratitudeReward = await getConnection().query(`
                select udt.device_token as "token",json_build_object('type','gratitude_reward', 'postId', p.id, 'photoURL', p.thumbnail_url,'usersName', array_to_json(array_agg(DISTINCT ou.fullname)), 'oozAmount', sum(wt.balance)) as "data"
                from wallet_transfers wt 
                inner join posts p on p.id = wt.post_id 
                inner join users ou on ou.id = wt.other_user_id 
                inner join users_device_token udt on udt.user_id = p.user_id::text
                where 
                    wt.created_at >= $1 and
                    wt.created_at < $2 and 
                    udt.device_token is not null and
                    wt.origin = 'gratitude_reward' and
                    wt."action" = 'received'
                group by p.id, udt.device_token 
                order by min(wt.created_at) asc 
                offset $3 limit $4;
                `,
                [ startDate.toISOString(), endDate.toISOString(), pagination.offset, pagination.limit]);
                
                if (!gratitudeReward || !gratitudeReward.length) {
                    pagination.finished = true;
                } else {
                    allGratitudeReward = allGratitudeReward.concat(gratitudeReward);
                    pagination.offset = allGratitudeReward.length;
                }
            }

            allGratitudeRewardGroupedByPost = this.groupByNotificationsByPostId(allGratitudeReward);

            if(allGratitudeRewardGroupedByPost.length) {
                await this.notificationMessagesService.sendFirebaseMessages(allGratitudeRewardGroupedByPost);
            }
        } catch(err) {
            this.captureExceptionSentry("push notification gratitude reward", err);
        }
    }

    groupByNotificationsByPostId(notifications) {
        let notificationsGrouped = [];
        notifications.forEach(notification => {
            let hasExistPost = notificationsGrouped.find( _notification => _notification.token == notification.token && _notification.data.postId == notification.data.postId );
            
            if (hasExistPost) {
                hasExistPost.data.usersName = _.uniq(hasExistPost.data.usersName.concat(notification.data.usersName));
                if (notification.data.oozAmount) {
                    hasExistPost.data.oozAmount += notification.data.oozAmount;
                }
            }
            else {
                notificationsGrouped.push(notification);
            }
        });

        notificationsGrouped.forEach( notification => {
            notification.data.usersName = JSON.stringify(notification.data.usersName);
            if(notification.data.oozAmount) {
                notification.data.oozAmount = JSON.stringify(notification.data.oozAmount);
            }
        });

        return notificationsGrouped;
    }

    captureExceptionSentry(initialMessage : string , error ) {
        console.log(initialMessage, error);
        Sentry.captureException(initialMessage, error);
    }

}
