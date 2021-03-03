import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {

    constructor(private readonly usersRepository : UsersRepository) {

    }

    async createUser(userData) {

        userData.password = bcryptjs.hashSync(userData.password, bcryptjs.genSaltSync(10));

        let user = await this.usersRepository.createUser(userData);
        delete user.password;

        return user;
       
    }

    async getUserByEmail(email : string) {
        return await this.usersRepository.getUserByEmail(email);
    }

}
