import { forwardRef, Module } from '@nestjs/common';
import { SqsWorkerService } from './sqs-worker.service';
import { DailyGoalDistributionHandlerService } from './daily-goal-distribution-handler/daily-goal-distribution-handler.service';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';
import { GeneralConfigModule } from 'src/general-config/general-config.module';
import { WalletTransfersModule } from 'src/wallet-transfers/wallet-transfers.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { StrapiWebhookHandlerService } from './strapi-webhook-handler/strapi-webhook-handler.service';
import { LearningTracksModule } from 'src/learning-tracks/learning-tracks.module';
import { MarketPlaceModule } from 'src/market-place/market-place.module';

@Module({
  imports: [
    forwardRef(() => WalletTransfersModule),
    WalletsModule,
    GeneralConfigModule,
    forwardRef(() => UsersModule),
    forwardRef(() => LearningTracksModule),
    forwardRef(() => MarketPlaceModule),
  ],
  providers: [SqsWorkerService, DailyGoalDistributionHandlerService, StrapiWebhookHandlerService],
  exports: [SqsWorkerService, DailyGoalDistributionHandlerService]
})
export class SqsWorkerModule {}
