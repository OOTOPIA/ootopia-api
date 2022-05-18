import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { UsersAppUsageTime } from "../entities/users-app-usage-time.entity";
import { AdminUsers } from '../entities/admin-user.entity';

@Injectable()
@EntityRepository(UsersAppUsageTime)
export class AdminUserRepository extends Repository<AdminUsers>{

    constructor() {
        super();
    }

    async getAdminById(id: string): Promise<AdminUsers> {
        return this.findOne({
            where: {
                userId: id
            }
        })
    }

}