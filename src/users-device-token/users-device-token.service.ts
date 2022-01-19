import { Injectable } from '@nestjs/common';
import { UpdateUsersDeviceTokenDto } from './dto/update-users-device-token.dto';
import { UsersDeviceTokenRepository } from './users-device-token.repository';

@Injectable()
export class UsersDeviceTokenService {
  constructor(
    private readonly usersDeviceTokenRepository : UsersDeviceTokenRepository, 
  ){}
  async updateTokenDeviceUser(userId: string, deviceToken: string, deviceId: string, language: string) {
      return this.usersDeviceTokenRepository.createOrUpdateTokenDevice(userId, deviceToken, deviceId, language);
  }
}
