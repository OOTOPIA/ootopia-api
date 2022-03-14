import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, Not, IsNull, Any,  } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { UsersDeviceToken } from "./entities/users-device-token.entity";

@Injectable()
@EntityRepository(UsersDeviceToken)
export class UsersDeviceTokenRepository extends Repository<UsersDeviceToken>{

    constructor() {
        super();
    }

     async createOrUpdateTokenDevice(userId: string, deviceToken: string, deviceId: string) {
        let result = await this.findOne({where: {deviceId}});
        
        if (result) {
            await this.create({id: result.id, deviceId: deviceId, deviceToken: deviceToken, userId: userId}).save();
        } else {
            await this.create({deviceId: deviceId, deviceToken: deviceToken, userId: userId}).save();
        }

    }

    async getDevicesTokenByUserId(usersId: string|string[] ) {
        usersId = !Array.isArray(usersId)? [usersId] :usersId;
        return this.find({where: {userId: Any(usersId), deviceToken: Not(IsNull()) }});
    }
}