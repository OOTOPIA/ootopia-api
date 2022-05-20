import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { AdminUsers } from '../entities/admin-user.entity';

@Injectable()
@EntityRepository(AdminUsers)
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