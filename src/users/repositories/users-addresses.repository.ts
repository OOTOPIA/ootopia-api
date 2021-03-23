import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { UsersAddresses } from "../entities/users-addresses.entity";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
@EntityRepository(UsersAddresses)
export class UsersAddressesRepository extends Repository<UsersAddresses>{

    async createOrUpdateUserAddress(userAddressData) {
        const userAddress = this.create();
        if (!userAddressData.id) {
            userAddress.id = uuidv4();
        }
        Object.assign(userAddress, userAddressData);
        return userAddress;
    }

}