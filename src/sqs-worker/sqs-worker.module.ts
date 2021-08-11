import { forwardRef, Module } from '@nestjs/common';
import { SqsWorkerService } from './sqs-worker.service';
import { DailyGoalDistributionHandlerService } from './daily-goal-distribution-handler/daily-goal-distribution-handler.service';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';
import { GeneralConfigModule } from 'src/general-config/general-config.module';
import { WalletTransfersModule } from 'src/wallet-transfers/wallet-transfers.module';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [
    forwardRef(() => WalletTransfersModule),
    WalletsModule,
    GeneralConfigModule,
    forwardRef(() => UsersModule),
  ],
  providers: [SqsWorkerService, DailyGoalDistributionHandlerService],
  exports: [SqsWorkerService, DailyGoalDistributionHandlerService]
})
export class SqsWorkerModule {}
