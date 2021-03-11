import { Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import * as camelcaseKeys from 'camelcase-keys';
import { Users } from "./users.entity";

@Injectable()
@EntityRepository(Users)
export class UsersRepository extends Repository<Users>{

    constructor() {
        super();
    }

    createUser(userData) {
        const user = this.create();
        Object.assign(user, userData);
        return this.save(user);
    }

    async getUserByEmail(email: string) {
        const user = await this.find({
          where: { email },
        });
        return (user && user.length ? user[0] : null);
    }

    async getUserById(id: string) {
        let user = await this.findOne({
          where: { id },
        });
        delete user.password;
        return user;
    }

}