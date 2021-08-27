import { Module } from '@nestjs/common';
import { InvitationsCodesService } from './invitations-codes.service';
import { InvitationsCodesController } from './invitations-codes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsCodeRepository } from './invitations-codes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationsCodeRepository]),],
  controllers: [InvitationsCodesController],
  providers: [InvitationsCodesService],
  exports: [InvitationsCodesService]
})
export class InvitationsCodesModule {}
