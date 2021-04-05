import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { Addresses } from "./addresses.entity";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
@EntityRepository(Addresses)
export class AddressesRepository extends Repository<Addresses>{

    async createOrUpdateAddress(addressData) {
        const userAddress = this.create();
        if (!addressData.id) {
            userAddress.id = uuidv4();
        }
        Object.assign(userAddress, addressData);
        return userAddress;
    }

}