import { Injectable } from '@nestjs/common';
import { UpdateUsersDeviceTokenDto } from './dto/update-users-device-token.dto';
import { UsersDeviceTokenRepository } from './users-device-token.repository';

@Injectable()
export class UsersDeviceTokenService {
  constructor(
    private readonly usersDeviceTokenRepository : UsersDeviceTokenRepository, 
  ){}
  async updateTokenDeviceUser(userId: string, deviceToken: string, deviceId: string) {
      console.log('chegou zeroooooo ',userId, deviceToken, deviceId);
      return this.usersDeviceTokenRepository.createOrUpdateTokenDevice(userId, deviceToken, deviceId);
  }

  findAll() {
    return `This action returns all usersDeviceToken`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usersDeviceToken`;
  }

  update(id: number, updateUsersDeviceTokenDto: UpdateUsersDeviceTokenDto) {
    return `This action updates a #${id} usersDeviceToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} usersDeviceToken`;
  }
}
