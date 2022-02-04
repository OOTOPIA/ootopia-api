import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { VideoModule } from './video/video.module';
import { AuthModule } from './auth/auth.module';
import { FilesUploadModule } from './files-upload/files-upload.module';
import { InterestsTagsModule } from './interests-tags/interests-tags.module';
import { CitiesModule } from './cities/cities.module';
import { WalletsModule } from './wallets/wallets.module';
import { WalletTransfersModule } from './wallet-transfers/wallet-transfers.module';
import { GeneralConfigModule } from './general-config/general-config.module';
import { EmailsModule } from './emails/emails.module';
import { CronService } from './cron/cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SqsWorkerModule } from './sqs-worker/sqs-worker.module';
import { BadgesModule } from './badges/badges.module';
import { InvitationsCodesModule } from './invitations-codes/invitations-codes.module'
import { LearningTracksModule } from './learning-tracks/learning-tracks.module';
import { StrapiModule } from './strapi/strapi.module';
import { MarketPlaceModule } from './market-place/market-place.module';
import { NotificationMessagesService } from './notification-messages/notification-messages.service';
import { UsersDeviceTokenModule } from './users-device-token/users-device-token.module';
import { LinksService } from './links/links.service';
import { AppleAppSiteAssociationModule } from './apple-app-site-association/apple-app-site-association.module';
import * as AWS from 'aws-sdk';

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  credentials: new AWS.Credentials(
    process.env.ACCESS_KEY_ID,
    process.env.SECRET_ACCESS_KEY,
  ),
  region: 'none',
});

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    SqsModule.registerAsync({
      useFactory:() =>{
        return {
          consumers: [{
            name: "daily_goal_distribution",
            queueUrl: process.env.SQS_DAILY_GOAL_DISTRIBUTION_QUEUE,
            sqs : sqs,
          },
          {
            name: "strapi_webhook",
            queueUrl: process.env.SQS_STRAPI_WEBHOOK_QUEUE,
            sqs : sqs,
          },
          {
            name: "update-post-video-status",
            queueUrl: process.env.SQS_CLOUDFLARE_WEBHOOK_QUEUE,
            sqs : sqs,
          }],
          producers: [{
            name: "daily_goal_distribution",
            queueUrl: process.env.SQS_DAILY_GOAL_DISTRIBUTION_QUEUE,
            region: process.env.SQS_DAILY_GOAL_DISTRIBUTION_QUEUE_REGION,
            sqs: sqs,
          },
          {
            name: "strapi_webhook",
            queueUrl: process.env.SQS_STRAPI_WEBHOOK_QUEUE,
            region: process.env.SQS_STRAPI_WEBHOOK_QUEUE_REGION,
            sqs: sqs,
          },
          {
            name: "update-post-video-status",
            queueUrl: process.env.SQS_CLOUDFLARE_WEBHOOK_QUEUE,
            region: process.env.SQS_CLOUDFLARE_WEBHOOK_QUEUE_REGION,
            sqs: sqs,
          }],
        };
      },
    }),
    PostsModule,
    UsersModule,
    VideoModule,
    AuthModule,
    FilesUploadModule,
    InterestsTagsModule,
    CitiesModule,
    WalletsModule,
    WalletTransfersModule,
    GeneralConfigModule,
    EmailsModule,
    SqsWorkerModule,
    BadgesModule,
    InvitationsCodesModule,
    LearningTracksModule,
    StrapiModule,
    MarketPlaceModule,
    UsersDeviceTokenModule,
    AppleAppSiteAssociationModule,
  ],
  controllers: [AppController],
  providers: [AppService, CronService, NotificationMessagesService, LinksService],
})
export class AppModule {}
