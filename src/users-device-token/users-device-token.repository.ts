import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { UsersDeviceToken } from "./entities/users-device-token.entity";

@Injectable()
@EntityRepository(UsersDeviceToken)
export class UsersDeviceTokenRepository extends Repository<UsersDeviceToken>{

    constructor() {
        super();
    }

     async createOrUpdateTokenDevice(userId: string, deviceToken: string,deviceId: string ) {
        let result = await this.findOne({where: {deviceId}});
        console.log('achjooy',result);
        
        if (result) {
            await this.create({id: result.id, deviceId: deviceId, deviceToken: deviceToken, userId: userId}).save();
        } else {
            await this.create({deviceId: deviceId, deviceToken: deviceToken, userId: userId}).save();
        }

    }
}