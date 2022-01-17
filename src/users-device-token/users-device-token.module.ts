import { Module } from '@nestjs/common';
import { UsersDeviceTokenService } from './users-device-token.service';
import { UsersDeviceTokenController } from './users-device-token.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersAppUsageTimeRepository } from 'src/users/repositories/users-app-usage-time.repository';
import { UsersDeviceTokenRepository } from './users-device-token.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersDeviceTokenRepository
    ])
  ],
  controllers: [UsersDeviceTokenController],
  providers: [UsersDeviceTokenService],
  exports: [UsersDeviceTokenService]
})
export class UsersDeviceTokenModule {}
