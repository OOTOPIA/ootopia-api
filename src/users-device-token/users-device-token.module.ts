import { Module, forwardRef } from '@nestjs/common';
import { UsersDeviceTokenService } from './users-device-token.service';
import { UsersDeviceTokenController } from './users-device-token.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersAppUsageTimeRepository } from 'src/users/repositories/users-app-usage-time.repository';
import { UsersDeviceTokenRepository } from './users-device-token.repository';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersDeviceTokenRepository,
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [UsersDeviceTokenController],
  providers: [UsersDeviceTokenService],
  exports: [UsersDeviceTokenService]
})
export class UsersDeviceTokenModule {}
