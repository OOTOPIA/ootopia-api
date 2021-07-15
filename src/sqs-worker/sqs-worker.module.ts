import { Module } from '@nestjs/common';
import { SqsWorkerService } from './sqs-worker.service';
import { DailyGoalDistributionHandlerService } from './daily-goal-distribution-handler/daily-goal-distribution-handler.service';

@Module({
  providers: [SqsWorkerService, DailyGoalDistributionHandlerService],
  exports: [SqsWorkerService]
})
export class SqsWorkerModule {}
