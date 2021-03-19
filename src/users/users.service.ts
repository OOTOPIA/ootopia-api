import { HttpException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcryptjs from 'bcryptjs';
import { Users } from './users.entity';

@Injectable()
export class UsersService {

    constructor(private readonly usersRepository : UsersRepository) {

    }

    async createUser(userData) {

        if (!userData.acceptedTerms) {
            throw new HttpException("You must accept the terms to register", 401);
        }

        userData.password = bcryptjs.hashSync(userData.password, bcryptjs.genSaltSync(10));

        let checkEmail = await this.getUserByEmail(userData.email);

        if (checkEmail != null) {
            throw new HttpException("EMAIL_ALREADY_EXISTS", 401);
        }

        let user = await this.usersRepository.createOrUpdateUser(userData);
        delete user.password;

        return user;
       
    }

    async updateUser(userData, photoFile = null) {

        let currentUser = await this.getUserById(userData.id);

        //TODO: Upload photo file
        let _userData : any = {
            id : userData.id,
            birthdate : userData.birthdate,
            dailyLearningGoalInMinutes : userData.dailyLearningGoalInMinutes,
            addressCountryCode : userData.addressCountryCode,
            addressState : userData.addressState,
            addressCity : userData.addressCity,
            addressLatitude : userData.addressLatitude,
            addressLongitude : userData.addressLongitude,
        };

        if (currentUser.registerPhase == 1) {
            _userData.registerPhase = 2;
        }

        //TODO: Save tags id's
        //TODO: Save address data in other table

        let user = await this.usersRepository.createOrUpdateUser(userData);
        delete user.password;

        return user;

    }

    async getUserByEmail(email : string) {
        return await this.usersRepository.getUserByEmail(email);
    }

    async getUserById(id : string) {
        return await this.usersRepository.getUserById(id);
    }

    async getUserProfile(id : string) {
        let user = await this.usersRepository.getUserById(id);
        delete user.email;
        delete user.dailyLearningGoalInMinutes;
        delete user.enableSustainableAds;
        delete user.createdAt;
        delete user.updatedAt;
        return user;
    }

}
