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
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { ConfigName } from 'src/general-config/general-config.entity';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';
import { UsersAppUsageTimeService } from './services/users-app-usage-time/users-app-usage-time.service';
import { InvitationsCodesService } from '../invitations-codes/invitations-codes.service';
import * as moment from 'moment-timezone';
import { Origin, WalletTransferAction } from 'src/wallet-transfers/wallet-transfers.entity';
import { BadgesService } from 'src/badges/badges.service';
import { UsersTrophiesService } from './services/users-trophies/users-trophies.service';
import { TrophyType } from './entities/users-trophies.entity';

import { CreateUserDto, UserProfileUpdateDto } from './users.dto';

@Injectable()
export class UsersService {

    constructor(
        private readonly usersRepository : UsersRepository, 
        private readonly filesUploadService : FilesUploadService,
        private readonly interestsTagsService : InterestsTagsService,
        private readonly citiesService : CitiesService,
        private readonly addressesRepository : AddressesRepository,
        private readonly walletsService : WalletsService,
        private readonly walletTransfersService : WalletTransfersService,
        private readonly generalConfigService : GeneralConfigService,
        private readonly usersAppUsageTimeService : UsersAppUsageTimeService,
        private readonly invitationsCodesService : InvitationsCodesService,
        private readonly badgesService : BadgesService,
        private readonly usersTrophiesService : UsersTrophiesService,
        ) {
    }

    async createUser(userData : CreateUserDto, photoFile = null) {

        if (!userData.acceptedTerms) {
            throw new HttpException("You must accept the terms to register", 401);
        }

        userData.password = bcryptjs.hashSync(userData.password, bcryptjs.genSaltSync(10));

        let checkEmail = await this.getUserByEmail(userData.email);

        if (checkEmail != null) {
            throw new HttpException("EMAIL_ALREADY_EXISTS", 401);
        }

        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        userData.invitationCode = !!userData.invitationCode ? userData.invitationCode : null;
        userData.birthdate = !!userData.birthdate ? userData.birthdate : null;

        let user = {
            id: null,
            photoUrl: null,
            invitationCodeAccepted: userData.invitationCode,
            addressId: null,
            badges: null,
            password: null,
        };

        let wallet;
		let invitation;

        try {

            user = await this.usersRepository.createOrUpdateUser(userData);
            wallet = await this.walletsService.createOrUpdateWallet({userId : user.id});
            
            if (photoFile != null) {
                let fileUrl = await this.filesUploadService.uploadFileToS3(photoFile.buffer, photoFile.originalname, user.id);
                user.photoUrl = fileUrl;
            }
            
            if (userData.tagsIds && userData.tagsIds.length > 0) {
                let tagsIds = userData.tagsIds.split(",");
                await this.interestsTagsService.updateUserTags(user.id, tagsIds, queryRunner);
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
                }

    
                let userAddress = await this.addressesRepository.createOrUpdateAddress(addressData);
                user.addressId = userAddress.id;
                
                await queryRunner.manager.save(userAddress);
            }

            if(userData.invitationCode) {
                invitation = await this.invitationsCodesService.getInvitationsCodesByCode(userData.invitationCode);
                if (!invitation) {
                    throw new HttpException("Invitation Code invalid", 401);
                }

                let oozToRewardSent, oozToRewardReceived;
			
                switch (invitation.type) {
                    case "sower":
                        oozToRewardSent = +(await this.generalConfigService.getConfig(ConfigName.USER_SENT_SOWER_INVITATION_CODE_OOZ)).value;
                        oozToRewardReceived = +(await this.generalConfigService.getConfig(ConfigName.USER_RECEIVED_SOWER_INVITATION_CODE_OOZ)).value;
                        await this.sendInvitationCodeReward(invitation.userId, user.id, oozToRewardSent, oozToRewardReceived, Origin.INVITATION_CODE_SENT, Origin.INVITATION_CODE_ACCEPTED, queryRunner);
					break;
                    case "default":
                        oozToRewardSent = +(await this.generalConfigService.getConfig(ConfigName.USER_SENT_DEFAULT_INVITATION_CODE_OOZ)).value;
                        oozToRewardReceived = +(await this.generalConfigService.getConfig(ConfigName.USER_RECEIVED_DEFAULT_INVITATION_CODE_OOZ)).value;
                        await this.sendInvitationCodeReward(invitation.userId, user.id, oozToRewardSent, oozToRewardReceived, Origin.INVITATION_CODE_SENT, Origin.INVITATION_CODE_ACCEPTED, queryRunner);
                    break;
                }
            }
			
			let userId = user.id;
			await queryRunner.manager.save(
				await this.invitationsCodesService.createOrUpdateInvitation({userId, type: 'default', active: true})
			);
			await queryRunner.manager.save(
				await this.invitationsCodesService.createOrUpdateInvitation({userId, type: 'sower', active: invitation?.type == 'sower'})
			);

            if (invitation?.type == 'sower') {
                let badge = await this.badgesService.findByType('sower');
                user.badges = badge;
                
                await queryRunner.manager.save(
                    user
                );
            }

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
			if (wallet && wallet.id)	await this.walletsService.delete(wallet.id);
			if (user && user.id)	await this.usersRepository.delete(user.id);
            throw err;
        }

        delete user.password;

        return user;
       
    }

    async updateUser(userData: UserProfileUpdateDto, photoFile = null) {

        let queryRunner = getConnection().createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        let currentUser = await this.getUserById(userData.id);

        let _userData: any = {
            id: userData.id,
            fullname: userData.fullname,
            phone: userData.phone,
            countryCode: userData.countryCode,
            bio: userData.bio,
            birthdate : userData.birthdate || null,
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

    async resetPassword(userId: string, password: string) {        
        password = bcryptjs.hashSync(password, bcryptjs.genSaltSync(10));
        return this.usersRepository.resetPassword(userId, password);    
    }

    async updateDailyGoalAchieved(userId: string, dailyGoalAchieved: boolean) {
        return this.usersRepository.updateDailyGoalAchieved(userId, dailyGoalAchieved);    
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

    async updateDontAskToConfirmGratitudeReward(id : string, value : boolean) {
        return await this.usersRepository.updateDontAskToConfirmGratitudeReward(id, value);
    }

    async recordAppUsageTime(data) {

        await this.usersAppUsageTimeService.recordAppUsageTime(data);
        await this.getUserDailyGoalStats(data.userId);
        
    }

    async getUserDailyGoalStats(id : string, dailyGoalStartTime? : Date, dailyGoalEndTime? : Date) {
        let user = await this.getUserById(id), globalGoalLimitTimeConfig;

        if (!dailyGoalStartTime || !dailyGoalEndTime) {
            globalGoalLimitTimeConfig = await this.generalConfigService.getConfig(ConfigName.GLOBAL_GOAL_LIMIT_TIME_IN_UTC);
        }

        if (!dailyGoalStartTime) dailyGoalStartTime = this.generalConfigService.getDailyGoalStartTime(globalGoalLimitTimeConfig.value);
        if (!dailyGoalEndTime) dailyGoalEndTime = this.generalConfigService.getDailyGoalEndTime(globalGoalLimitTimeConfig.value);

        let remainingTimeUntilEndOfGameInMs = moment(dailyGoalEndTime).diff(moment.utc(), 'milliseconds');
        let remainingTimeUntilEndOfGame = this.msToTime(remainingTimeUntilEndOfGameInMs);

        if (!+user.dailyLearningGoalInMinutes) {
            return {
                id,
                dailyGoalInMinutes : 0,
                dailyGoalEndsAt : dailyGoalEndTime,
                dailyGoalAchieved : false,
                totalAppUsageTimeSoFar : 0,
                totalAppUsageTimeSoFarInMs : 0,
                accumulatedOOZ : 0,
                remainingTimeUntilEndOfGame : remainingTimeUntilEndOfGame,
                remainingTimeUntilEndOfGameInMs : remainingTimeUntilEndOfGameInMs,
                percentageOfDailyGoalAchieved : 0
            };
        }

        let totalAppUserUsageTimeInMs = await this.usersAppUsageTimeService.getTimeSumOfUserUsedAppInThisPeriod(id, dailyGoalStartTime);
        let totalTimeInMinutes = Math.floor(totalAppUserUsageTimeInMs / 60000);
        let dailyGoalAchieved = (+totalTimeInMinutes >= +user.dailyLearningGoalInMinutes);
        let dailyGoalAchievedSoFar = this.msToTime(totalAppUserUsageTimeInMs);
        let accumulatedOOZ = await this.walletTransfersService.getUserOOZAccumulatedInThisPeriod(id, false, dailyGoalStartTime);
        let dailyLearningGoalInMs = +user.dailyLearningGoalInMinutes * 60000;
        let percentageOfDailyGoalAchieved = +((totalAppUserUsageTimeInMs/dailyLearningGoalInMs) * 100).toFixed(1);

        if (user.dailyGoalAchieved != dailyGoalAchieved) {
            let result = await this.updateDailyGoalAchieved(user.id, dailyGoalAchieved);
            if (dailyGoalAchieved && result.status == 'ok') {
                await this.usersTrophiesService.createOrUpdateTrophy({
                    userId : user.id,
                    trophyType : TrophyType.PERSONAL,
                });
                await this.walletTransfersService.transferPersonalGoalAchieved(user.id);
            }
        }

        var dailyGoalStats = {
            id,
            dailyGoalInMinutes : +user.dailyLearningGoalInMinutes,
            dailyGoalEndsAt : dailyGoalEndTime,
            dailyGoalAchieved : dailyGoalAchieved,
            totalAppUsageTimeSoFar : dailyGoalAchievedSoFar,
            totalAppUsageTimeSoFarInMs : totalAppUserUsageTimeInMs,
            accumulatedOOZ : accumulatedOOZ,
            remainingTimeUntilEndOfGame : remainingTimeUntilEndOfGame,
            remainingTimeUntilEndOfGameInMs : remainingTimeUntilEndOfGameInMs,
            percentageOfDailyGoalAchieved : percentageOfDailyGoalAchieved >= 100 ? 100 : percentageOfDailyGoalAchieved
        };



        return dailyGoalStats;

    }

    async putDialogOpened(id : string, dialogType : string){
       return await this.usersRepository.putDialogOpened(id, dialogType)
    }

    msToTime(duration) {

        var seconds : any = Math.floor((duration / 1000) % 60),
          minutes : any = Math.floor((duration / (1000 * 60)) % 60),
          hours : any = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
      
        return (+hours ? hours + "h " : "") + minutes + "m " + seconds + "s";
    }

    private async sendInvitationCodeReward(fromUserId: string, toUserId: string, oozToRewardSent : number, oozToRewardReceived : number, originSent : string, originReceived : string, queryRunner) {

        const fromUserWalletId = (await this.walletsService.getWalletByUserId(fromUserId)).id;
        const toUserWalletId = (await this.walletsService.getWalletByUserId(toUserId)).id;

        await queryRunner.manager.save(
            await this.walletTransfersService.createTransfer(
                fromUserId,
                {
                userId: fromUserId,
                walletId: fromUserWalletId,
                otherUserId : toUserId,
                balance: oozToRewardSent,
                origin: originSent,
                action: WalletTransferAction.SENT,
                fromPlatform: true,
                processed: true,
                },
                true,
            ),
        );
  
        await queryRunner.manager.save(
          await this.walletTransfersService.createTransfer(
            toUserId,
            {
              userId: toUserId,
              walletId: toUserWalletId,
              otherUserId : fromUserId,
              balance: oozToRewardReceived,
              origin: originReceived,
              action: WalletTransferAction.RECEIVED,
              fromPlatform: true,
              processed: true,
            },
            true,
          ),
        );
		
        await queryRunner.manager.save(
            await this.walletsService.increaseTotalBalance(
                fromUserWalletId,
                fromUserId,
                oozToRewardReceived,
            ),
        );

        await queryRunner.manager.save(
            await this.walletsService.increaseTotalBalance(
                toUserWalletId,
                toUserId,
                oozToRewardReceived,
            ),
        );

    }

    async validationEmail(email) {
        return !!(await this.usersRepository.getUserByEmail(email));
    }

}
