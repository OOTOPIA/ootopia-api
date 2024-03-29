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

import { CreateUserDto, FilterSearchUsers, JSONType, SuggestedFriendsDto, SuggestedFriendsRepositoryDto, UserProfileUpdateDto } from './users.dto';
import { LinksService } from 'src/links/links.service';
import { UsersDeviceTokenService } from 'src/users-device-token/users-device-token.service';
import { NotificationMessagesService } from 'src/notification-messages/notification-messages.service';
import { AdminUserRepository } from './repositories/admin-user.repository';

@Injectable()
export class UsersService {

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly linksService: LinksService,
        private readonly filesUploadService: FilesUploadService,
        private readonly interestsTagsService: InterestsTagsService,
        private readonly citiesService: CitiesService,
        private readonly addressesRepository: AddressesRepository,
        private readonly walletsService: WalletsService,
        private readonly walletTransfersService: WalletTransfersService,
        private readonly generalConfigService: GeneralConfigService,
        private readonly usersAppUsageTimeService: UsersAppUsageTimeService,
        private readonly invitationsCodesService: InvitationsCodesService,
        private readonly badgesService: BadgesService,
        private readonly usersTrophiesService: UsersTrophiesService,
        private readonly usersDeviceTokenService: UsersDeviceTokenService,
        private readonly notificationMessagesService: NotificationMessagesService,
        private readonly adminUserRepository: AdminUserRepository
    ) {
    }

    async createUser(userData, photoFile = null) {

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

        userData = this.jsonDecodeOrEncoderUserLinks(userData, JSONType.decode);

        userData.invitationCodeAccepted = !!userData.invitationCode ? userData.invitationCode : null;
        userData.birthdate = !!userData.birthdate ? userData.birthdate : null;

        let user: any = {
            id: null,
            photoUrl: null,
            invitationCodeAccepted: userData.invitationCodeAccepted,
            addressId: null,
            badges: null,
            password: null,
        };

        if (userData.languages && userData.languages.length >= 2) {
            userData.languages = userData.languages.split(",")
        } else {
            userData.languages = []
        }

        let wallet;
        let invitation;

        try {
            user = await this.usersRepository.createOrUpdateUser(userData);
            wallet = await this.walletsService.createOrUpdateWallet({ userId: user.id });

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
                        city: userData.addressCity,
                        state: userData.addressState,
                        country: userData.addressCountryCode,
                    });
                }

                let addressData: any = {
                    city: city,
                    lat: userData.addressLatitude,
                    lng: userData.addressLongitude,
                }


                let userAddress = await this.addressesRepository.createOrUpdateAddress(addressData);
                user.addressId = userAddress.id;

                await queryRunner.manager.save(userAddress);
            }

            if (userData.invitationCodeAccepted) {
                invitation = await this.invitationsCodesService.getInvitationsCodesByCode(userData.invitationCodeAccepted);
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
                await this.invitationsCodesService.createOrUpdateInvitation({ userId, type: 'default', active: true })
            );
            await queryRunner.manager.save(
                await this.invitationsCodesService.createOrUpdateInvitation({ userId, type: 'sower', active: invitation?.type == 'sower' })
            );

            if (invitation?.type == 'sower') {
                let badge = await this.badgesService.findByType('sower');
                user.badges = badge;
            }

            await queryRunner.manager.save(
                user
            );

            await queryRunner.commitTransaction();

            user = this.jsonDecodeOrEncoderUserLinks(user, JSONType.encoder);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            if (wallet && wallet.id) await this.walletsService.delete(wallet.id);
            if (user && user.id) await this.usersRepository.delete(user.id);
            throw err;
        } finally {
            await queryRunner.release();
        }

        delete user.password;
        return user;

    }

    async updateUser(userData: UserProfileUpdateDto, photoFile = null) {
        let queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let currentUser = await this.getUserById(userData.id);
        userData = this.jsonDecodeOrEncoderUserLinks(userData, JSONType.decode);
        let _userData: any = {
            id: userData.id,
            fullname: userData.fullname,
            phone: userData.phone,
            countryCode: userData.countryCode,
            bio: userData.bio,
            birthdate: userData.birthdate || null,
            dailyLearningGoalInMinutes: userData.dailyLearningGoalInMinutes,
            dialCode: userData.dialCode,
            links: userData.links || null,
            languages: userData.languages || []
        };

        if (photoFile != null) {
            let fileUrl = await this.filesUploadService.uploadFileToS3(photoFile.buffer, photoFile.originalname, currentUser.id);
            _userData.photoUrl = fileUrl;
        }

        if (userData.languages) {
            _userData.languages = userData.languages.split(",");
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
                    city: userData.addressCity,
                    state: userData.addressState,
                    country: userData.addressCountryCode,
                });
            }

            let addressData: any = {
                city: city,
                lat: userData.addressLatitude,
                lng: userData.addressLongitude,
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
        await queryRunner.release();

        userData = this.jsonDecodeOrEncoderUserLinks(userData, JSONType.encoder);

        return Object.assign(currentUser, _userData);

    }

    async updateLinks(value, userId, typeLink: string, create: Boolean = true) {
        let currentUser;

        if (userId) {
            currentUser = await this.getUserById(userId);
        } else if (value.author) {
            currentUser = this.jsonDecodeOrEncoderUserLinks(await this.getUserByEmail(value.author), JSONType.encoder);
        }

        if (currentUser && currentUser.links) {
            let existLink = currentUser.links.find(link => {
                let parts = link.URL.split('shared/');
                return parts[parts.length - 1] == value.id;
            });

            if (!existLink && create) {
                // create link
                switch (typeLink) {
                    case 'market-place':
                        currentUser.links.push({
                            URL: `${process.env.LINK_SHARING_URL_API}market-place/shared/${value.id}`,
                            title: `${value.title}`
                        });
                        break;
                    case 'learning-tracks':
                        currentUser.links.push({
                            URL: `${process.env.LINK_SHARING_URL_API}learning-tracks/shared/${value.id}`,
                            title: `${value.title}`
                        });
                        break;
                }
            }
            if (existLink && create) {
                // change title link
                existLink.title = `${value.title}`;

            }
            if (existLink && !create) {
                // delete link
                currentUser.links = currentUser.links.filter(link => {
                    let parts = link.URL.split('shared/');
                    return parts[parts.length - 1] != value.id;
                })
            }

            if (currentUser.links) {
                // remove duplicate links
                let uniqueLinks = [];
                currentUser.links = currentUser.links.filter((link) => {
                    let exist = false;
                    if (!uniqueLinks.find(uniqueLink => link.URL == uniqueLink)) {
                        uniqueLinks.push(link.URL);
                        exist = true;
                    }
                    return exist;
                })
            }

            await this.usersRepository.createOrUpdateUser({
                id: currentUser.id,
                links: currentUser.links,
            });

        }
    }

    async resetPassword(userId: string, password: string) {
        password = bcryptjs.hashSync(password, bcryptjs.genSaltSync(10));
        return this.usersRepository.resetPassword(userId, password);
    }

    async updateDailyGoalAchieved(userId: string, dailyGoalAchieved: boolean) {
        return this.usersRepository.updateDailyGoalAchieved(userId, dailyGoalAchieved);
    }

    async getUserByEmail(email: string) {
        return await this.usersRepository.getUserByEmail(email);
    }

    async getUserById(id: string) {
        return this.jsonDecodeOrEncoderUserLinks(await this.usersRepository.getUserById(id), JSONType.encoder);
    }

    async getUserProfile(id: string) {
        let user = await this.getUserById(id);
        if(!user) {
            throw new HttpException('User not found', 404);
        }
        delete user.email;
        delete user.dailyLearningGoalInMinutes;
        delete user.enableSustainableAds;
        delete user.addressId;
        delete user.registerPhase;
        delete user.createdAt;
        delete user.updatedAt;
        return user;
    }

    async updateDontAskToConfirmGratitudeReward(id: string, value: boolean) {
        return await this.usersRepository.updateDontAskToConfirmGratitudeReward(id, value);
    }

    async recordAppUsageTime(data) {

        await this.usersAppUsageTimeService.recordAppUsageTime(data);
        await this.getUserDailyGoalStats(data.userId);

    }

    async retrieveSuggestedFriends(id, suggestedFriends: SuggestedFriendsDto) {
        let suggestedFriendsRepositor: SuggestedFriendsRepositoryDto = {
            id,
            offset: (suggestedFriends.page - 1) * suggestedFriends.limit,
            importedContactEmails: suggestedFriends.importedContactEmails || null,
            importedContactNumbers: suggestedFriends.importedContactNumbers || null,
            limit: suggestedFriends.limit > 100 ? 100 : suggestedFriends.limit,
        }

        return { friends: (await this.usersRepository.retrieveSuggestedFriends(suggestedFriendsRepositor)) };
    }

    async friendsSuggestedProfile(id, suggestedFriends: SuggestedFriendsDto) {
        let suggestedFriendsRepositor: SuggestedFriendsRepositoryDto = {
            id,
            offset: (suggestedFriends.page - 1) * suggestedFriends.limit,
            importedContactEmails: suggestedFriends.importedContactEmails || null,
            importedContactNumbers: suggestedFriends.importedContactNumbers || null,
            limit: suggestedFriends.limit > 100 ? 100 : suggestedFriends.limit,
        }

        return { friends: (await this.usersRepository.friendsSuggestedProfile(suggestedFriendsRepositor)) };
    }

    async getUserDailyGoalStats(id: string, dailyGoalStartTime?: Date, dailyGoalEndTime?: Date) {
        let user = await this.getUserById(id), globalGoalLimitTimeConfig;

        if (!dailyGoalStartTime || !dailyGoalEndTime) {
            globalGoalLimitTimeConfig = await this.generalConfigService.getConfig(ConfigName.GLOBAL_GOAL_LIMIT_TIME_IN_UTC);
        }

        if (!dailyGoalStartTime) dailyGoalStartTime = this.generalConfigService.getDailyGoalStartTime(globalGoalLimitTimeConfig.value);
        if (!dailyGoalEndTime) dailyGoalEndTime = this.generalConfigService.getDailyGoalEndTime(globalGoalLimitTimeConfig.value);

        let remainingTimeUntilEndOfGameInMs = moment(dailyGoalEndTime).diff(moment.utc(), 'milliseconds');
        let remainingTimeUntilEndOfGame = this.msToTime(remainingTimeUntilEndOfGameInMs);

        if (!+user.dailyLearningGoalInMinutes || !user.dailyLearningGoalInMinutes) {
            return {
                id,
                dailyGoalInMinutes: 0,
                dailyGoalEndsAt: dailyGoalEndTime,
                dailyGoalAchieved: false,
                totalAppUsageTimeSoFar: 0,
                totalAppUsageTimeSoFarInMs: 0,
                accumulatedOOZ: 0,
                remainingTimeUntilEndOfGame: remainingTimeUntilEndOfGame,
                remainingTimeUntilEndOfGameInMs: remainingTimeUntilEndOfGameInMs,
                percentageOfDailyGoalAchieved: 0,
            };
        }

        let totalAppUserUsageTimeInMs = await this.usersAppUsageTimeService.getTimeSumOfUserUsedAppInThisPeriod(id, dailyGoalStartTime);
        let totalTimeInMinutes = Math.floor(totalAppUserUsageTimeInMs / 60000);
        let dailyGoalAchieved = (+totalTimeInMinutes >= +user.dailyLearningGoalInMinutes);
        let dailyGoalAchievedSoFar = this.msToTime(totalAppUserUsageTimeInMs);
        let accumulatedOOZ = await this.walletTransfersService.getUserOOZAccumulatedInThisPeriod(id, false, dailyGoalStartTime);
        let dailyLearningGoalInMs = +user.dailyLearningGoalInMinutes * 60000;
        let percentageOfDailyGoalAchieved = +((totalAppUserUsageTimeInMs / dailyLearningGoalInMs) * 100).toFixed(1);

        if (user.dailyGoalAchieved != dailyGoalAchieved) {
            let result = await this.updateDailyGoalAchieved(user.id, dailyGoalAchieved);
            if (dailyGoalAchieved && result.status == 'ok') {
                await this.usersTrophiesService.createOrUpdateTrophy({
                    userId: user.id,
                    trophyType: TrophyType.PERSONAL,
                });
                await this.walletTransfersService.transferPersonalGoalAchieved(user.id);
            }
        }

        return {
            id,
            dailyGoalInMinutes: +user.dailyLearningGoalInMinutes,
            dailyGoalEndsAt: dailyGoalEndTime,
            dailyGoalAchieved: dailyGoalAchieved,
            totalAppUsageTimeSoFar: dailyGoalAchievedSoFar,
            totalAppUsageTimeSoFarInMs: totalAppUserUsageTimeInMs,
            accumulatedOOZ: accumulatedOOZ,
            remainingTimeUntilEndOfGame: remainingTimeUntilEndOfGame,
            remainingTimeUntilEndOfGameInMs: remainingTimeUntilEndOfGameInMs,
            percentageOfDailyGoalAchieved: percentageOfDailyGoalAchieved >= 100 ? 100 : percentageOfDailyGoalAchieved
        };

    }

    async updateAccumulatedOOZInDeviceUser(userId: string) {
        let userDailyGoal = await this.getUserDailyGoalStats(userId);
        Object.keys(userDailyGoal).forEach(key => userDailyGoal[key] = typeof userDailyGoal[key] == 'string' ? userDailyGoal[key] : "" + userDailyGoal[key])
        let allTokensDevices = await this.usersDeviceTokenService.getByUsersId(userId);
        let messagesNotification = allTokensDevices.map(device => (
            {
                token: device.deviceToken,
                data: {
                    type: 'update_regeneration_game',
                    ...userDailyGoal
                }
            }
        ));
        if (messagesNotification.length) await this.notificationMessagesService.sendFirebaseMessages(messagesNotification);
    }

    async putDialogOpened(id: string, dialogType: string) {
        return await this.usersRepository.putDialogOpened(id, dialogType)
    }

    getRecoverPasswordLink() {
        return this.linksService.linkForShared({
            title: "Recover Password",
        });
    }

    async getUsersList(filter: FilterSearchUsers) {
        let excludedUsers;
        if (filter.excludedUsers) {
            excludedUsers = filter.excludedUsers.split(',')
        }
        let skip = (filter.page - 1) * filter.limit;
        filter.limit = filter.limit > 100 ? 100 : filter.limit;

        if (skip < 0 || (skip == 0 && filter.limit == 0)) {
            throw new HttpException(
                {
                    status: 404,
                    error: "Page not found",
                },
                404
            );
        }
        return this.usersRepository.usersList(skip, filter.limit, filter.fullname, excludedUsers);
    }

    msToTime(duration) {

        var seconds: any = Math.floor((duration / 1000) % 60),
            minutes: any = Math.floor((duration / (1000 * 60)) % 60),
            hours: any = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return (+hours ? hours + "h " : "") + minutes + "m " + seconds + "s";
    }

    private async sendInvitationCodeReward(fromUserId: string, toUserId: string, oozToRewardSent: number, oozToRewardReceived: number, originSent: string, originReceived: string, queryRunner) {

        const fromUserWalletId = (await this.walletsService.getWalletByUserId(fromUserId)).id;
        const toUserWalletId = (await this.walletsService.getWalletByUserId(toUserId)).id;

        await queryRunner.manager.save(
            await this.walletTransfersService.createTransfer(
                fromUserId,
                {
                    userId: fromUserId,
                    walletId: fromUserWalletId,
                    //otherUserId : toUserId,
                    balance: oozToRewardSent,
                    origin: originSent,
                    action: WalletTransferAction.RECEIVED,
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
                    otherUserId: fromUserId,
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

    jsonDecodeOrEncoderUserLinks(user, type: JSONType) {
        try {
            if (type == 'decode') {
                if (user.links && !Array.isArray(user.links)) {
                    user.links = JSON.parse(user.links);
                }
                if (user.links && Array.isArray(user.links)) {
                    user.links = user.links.map(link => JSON.stringify(link));
                }
            } else {
                if (user.links && !Array.isArray(user.links)) {
                    user.links = JSON.parse(user.links);
                }

                if (user.links && Array.isArray(user.links)) {
                    user.links = user.links.map(link => JSON.parse(link));
                }
            }
        } catch (error) {

        }
        return user;
    }
    async deleteUser(adminId: string, id: string) {
        let userAdmin = await this.adminUserRepository.getAdminById(adminId)
        if (!userAdmin) {
            throw new HttpException("UNAUTHORIZED", 403);
        }
        let deleteUserAdmin = await this.adminUserRepository.getAdminById(id)
        if (deleteUserAdmin) {
            throw new HttpException("User is admin", 400);
        }
        let user = await this.usersRepository.getUserById(id)
        if (user.bannedAt) {
            throw new HttpException("User already banned", 400);
        }
        await this.usersRepository.selfDeleteUser(id)
    }

}
