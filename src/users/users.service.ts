import { HttpException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcryptjs from 'bcryptjs';
import { Users } from './users.entity';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import { getConnection } from 'typeorm';
import { InterestsTagsService } from 'src/interests-tags/services/interests-tags.service';
import { CitiesService } from 'src/cities/cities.service';
import { AddressesRepository } from '../addresses/addresses.repository';
import { WalletsService } from 'src/wallets/wallets.service';

@Injectable()
export class UsersService {

    constructor(
        private readonly usersRepository : UsersRepository, 
        private readonly filesUploadService : FilesUploadService,
        private readonly interestsTagsService : InterestsTagsService,
        private readonly citiesService : CitiesService,
        private readonly addressesRepository : AddressesRepository,
        private readonly walletsService : WalletsService) {
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
        await this.walletsService.createOrUpdateWallet({
            userId : user.id,
        });
        delete user.password;

        return user;
       
    }

    async updateUser(userData, photoFile = null) {

        let queryRunner = getConnection().createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        let currentUser = await this.getUserById(userData.id);

        let _userData : any = {
            id : userData.id,
            birthdate : userData.birthdate,
            dailyLearningGoalInMinutes : userData.dailyLearningGoalInMinutes,
        };

        if (photoFile != null) {
            let fileUrl = await this.filesUploadService.uploadFileToS3(photoFile.buffer, photoFile.originalname, currentUser.id);
            _userData.photoUrl = fileUrl;
        }

        if (currentUser.registerPhase == 1) {
            _userData.registerPhase = 2;
        }

        if (userData.tagsIds && userData.tagsIds.length > 0) {
            let tagsIds = userData.tagsIds.split(",");
            await this.interestsTagsService.updateUserTags(userData.id, tagsIds, queryRunner);
        }

        if (userData.addressCountryCode && userData.addressState && userData.addressCity) {

            let city = await this.citiesService.getCity(userData.addressCity, userData.addressState, userData.addressCountryCode);
            if (!city) {
                city = await this.citiesService.createCity({
                    city : userData.addressCity,
                    state : userData.addressState,
                    country : userData.addressCountryCode,
                });
            }

            let addressData : any = {
                city : city,
                lat : userData.addressLatitude,
                lng : userData.addressLongitude,
            };

            if (currentUser.addressId) {
                addressData.id = currentUser.addressId;
            }

            let userAddress = await this.addressesRepository.createOrUpdateAddress(addressData);
            _userData.addressId = userAddress.id;
            
            await queryRunner.manager.save(userAddress);

        }

        await queryRunner.manager.save(await this.usersRepository.create(_userData));
        await queryRunner.commitTransaction();
        
        return Object.assign(currentUser, _userData);

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
        delete user.addressId;
        delete user.registerPhase;
        delete user.createdAt;
        delete user.updatedAt;
        return user;
    }

}
