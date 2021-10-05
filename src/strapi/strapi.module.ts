import { forwardRef, Module } from '@nestjs/common';
import { StrapiService } from './strapi.service';
import { StrapiController } from './strapi.controller';
import { SqsWorkerModule } from 'src/sqs-worker/sqs-worker.module';

@Module({
  imports: [
    forwardRef(() => SqsWorkerModule)
  ],
  providers: [StrapiService],
  exports: [StrapiService],
  controllers: [StrapiController],
})
export class StrapiModule {}
