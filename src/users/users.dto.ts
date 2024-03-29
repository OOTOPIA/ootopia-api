import { IsNotEmpty, min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Double } from 'typeorm';
import { FriendsThumbs } from 'src/friends/dto/friends.dto';

class UserLinks {
    @ApiProperty({ required: false, example : "www.google.com.br"})
    URL : string;

    @ApiProperty({ required: false, example : "Google"})
    title : string;
}

export enum JSONType {
    decode = 'decode',
    encoder = 'encoder'
} 

export class CreateUserDto {

    @ApiProperty({ required: true})
    @IsNotEmpty()
    fullname : string;

    @ApiProperty({ required: true})
    @IsNotEmpty()
    email : string;

    @ApiProperty({ required: true})
    @IsNotEmpty()
    password : string;

    @ApiProperty({ required: true})
    acceptedTerms : boolean;

    @ApiProperty({required: false})
    countryCode: string;

    @ApiProperty({required: false})
    languages: string

    @ApiProperty()
    dialCode: string;

    @ApiProperty()
    phone: string;

    @ApiProperty({required: false})
    bio: string;

    @ApiProperty({ required: false, type: "file", description: "User photo" })
    file : object;

    @ApiProperty({ example : "1993/07/08", description: "User birthdate in format YYYY-MM-DD" })
    birthdate : Date;

    @ApiProperty({type: "number", minimum: 10, maximum: 60})
    dailyLearningGoalInMinutes : number;

    @ApiProperty({required: false})
    addressCountryCode : string;

    @ApiProperty({required: false})
    addressState : string;
    
    @ApiProperty({required: false})
    addressCity : string;

    @ApiProperty({required: false})
    addressLatitude : number;

    @ApiProperty({required: false})
    addressLongitude : number;

    @ApiProperty({required: false,description: "IDs of selected tags separated by commas"})
    tagsIds : string;
    
    @ApiProperty({ required: false})
    invitationCode : string;

    @ApiProperty({ required: false, description: "this field is received in JSON format"})
    links : [UserLinks];
}

export class CreatedUserDto {

    @ApiProperty()
    id : string;

    @ApiProperty()
    fullname : string;

    @ApiProperty()
    email : string;

    @ApiProperty({ example : "1993-07-08", description: "User birthdate in format YYYY-MM-DD" })
    birthdate : string;

    @ApiProperty()
    photoUrl : string;

    @ApiProperty()
    bio : string;

    @ApiProperty()
    acceptedTerms : boolean;

    @ApiProperty()
    dailyLearningGoalInMinutes : number;

    @ApiProperty()
    enableSustainableAds : boolean;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

    @ApiProperty({type: [UserLinks]})
    links : [UserLinks];
}

export class UserLoginDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    email : string;
  
    @ApiProperty({ required: true })
    @IsNotEmpty()
    password : string;
  
}

export class DeviceTokenDTO {

    @ApiProperty({ required: true })
    deviceToken : string;

    @ApiProperty({ required: true })
    deviceId : string;
}

export class RecoverPasswordDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    email : string;

    @ApiProperty({ required: false, enum: ['ptbr', 'en'] })
    language : string;
  
}

export class FilterSearchUsers {
    @ApiProperty({ required: true, example : 1 })
    @IsNotEmpty()
    page : number;

    @ApiProperty({ required: true, example : 50 })
    @IsNotEmpty()
    limit : number;

    @ApiProperty({ required: true, example : "joão" })
    @IsNotEmpty()
    fullname: string;

    @ApiProperty({required: false})
    excludedUsers?: string;
}


export class ResetPasswordDto {
           
    @ApiProperty({ required: true })
    @IsNotEmpty()
    password : string;   
  
}

export class UserOfContact {
    @ApiProperty({ required: true, example: true })
    isMarketPlace: boolean;

    @ApiProperty({ required: true, example: true })
    isLearningTracks: boolean;

    @ApiProperty({ required: true, example: true })
    hasNumberPhone: boolean;

    @ApiProperty({ required: true, example: true })
    hasEmail: boolean;

    @ApiProperty({ required: true, nullable : true, example: 50 })
    totalPosts: number;

    @ApiProperty({ nullable : true, type: [FriendsThumbs, FriendsThumbs, FriendsThumbs, FriendsThumbs, FriendsThumbs] })
    friendsThumbs: FriendsThumbs[];

    @ApiProperty({ required: true, example: "d651768b-6c9a-45ef-aa18-1d90b9dcc223" })
    id: string;
    
    @ApiProperty({ required: true, example: "Claudio Fake" })
    fullname: string;
    
    @ApiProperty({ required: true, nullable : true })
    photoUrl: string;

    @ApiProperty({ required: true, example: "2021-04-09T18:02:59.219Z"})
    createdAt: Date;

    @ApiProperty({ required: true ,nullable : true, example: "Bertioga" })
    city: string;

    @ApiProperty({ required: true, example: "São Paulo" })
    state: string;

    @ApiProperty({ required: true, example: "BR" })
    country: string;
}

export class SuggestedByUserInProfile {
    @ApiProperty({ required: true, example: true })
    isContact: boolean;

    @ApiProperty({ required: true, example: true })
    sentOOzOfPosts: boolean;

    @ApiProperty({ required: true, example: true })
    recevedOOzOfPosts: boolean;

    @ApiProperty({ required: true, example: true })
    usersCommentedOnPosts: boolean;

    @ApiProperty({ required: true, example: true })
    commentsReceivedOnthePosts: boolean;

    @ApiProperty({ required: true, example: true })
    usersWithMoreFriends: boolean;
    
    @ApiProperty({ required: true, example: true })
    usersWithMarketPlace: boolean;

    @ApiProperty({ required: true, example: true })
    usersWithLearningTrack: boolean;

    @ApiProperty({ nullable : true, type: [FriendsThumbs, FriendsThumbs, FriendsThumbs, FriendsThumbs, FriendsThumbs] })
    friendsThumbs: FriendsThumbs[];

    @ApiProperty({ required: true, example: "d651768b-6c9a-45ef-aa18-1d90b9dcc223" })
    id: string;
    
    @ApiProperty({ required: true, example: "Claudio Fake" })
    fullname: string;
    
    @ApiProperty({ required: true, nullable : true })
    photoUrl: string;

    @ApiProperty({ required: true, example: "2021-04-09T18:02:59.219Z"})
    createdAt: Date;

    @ApiProperty({ required: true ,nullable : true, example: "Bertioga" })
    city: string;

    @ApiProperty({ required: true, example: "São Paulo" })
    state: string;

    @ApiProperty({ required: true, example: "BR" })
    country: string;
}

export class FriendByUser {
    @ApiProperty({ required: true, type: UserOfContact})
    @IsNotEmpty()
    friends : UserOfContact;
}

export class FriendSuggestedByUserInProfile {
    @ApiProperty({ required: true, type: SuggestedByUserInProfile})
    @IsNotEmpty()
    friends : UserOfContact;
}

export class SuggestedFriendsDto {
    @ApiProperty({ required: false })
    importedContactNumbers? : string[];
    
    @ApiProperty({ required: false })
    importedContactEmails? : string[];

    @ApiProperty({ required: true, example: 100})
    @IsNotEmpty()
    limit : number;

    @ApiProperty({ required: true, example: 1 })
    @IsNotEmpty()
    page : number;
}

export class SuggestedFriendsRepositoryDto {
    @ApiProperty({ required: false })
    id: string;
           
    @ApiProperty({ required: false })
    importedContactNumbers : string[];
    
    @ApiProperty({ required: false })
    importedContactEmails : string[];

    @ApiProperty({ required: true })
    @IsNotEmpty()
    offset : number;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    limit : number;
}

export class ResetPasswordResponseDto {
           
    @ApiProperty()
    status : string;   
  
}

export class LoggedUserDto {

    @ApiProperty()
    id : string;

    @ApiProperty()
    fullname : string;

    @ApiProperty()
    email : string;

    @ApiProperty({ example : "1993-07-08", description: "User birthdate in format YYYY-MM-DD" })
    birthdate : string;

    @ApiProperty()
    photoUrl : string;

    @ApiProperty()
    bio : string;

    @ApiProperty()
    dailyLearningGoalInMinutes : number;

    @ApiProperty()
    enableSustainableAds : boolean;
    
    @ApiProperty()
    registerPhase : number;

    @ApiProperty({ description: "Generated JWT to use on HTTP Headers Authorization" })
    token : string;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}

export class UserProfileDto {

    @ApiProperty()
    id : string;

    @ApiProperty()
    fullname : string;

    @ApiProperty({ example : "1993-07-08", description: "User birthdate in format YYYY-MM-DD" })
    birthdate : string;

    @ApiProperty({ type: "number", minimum: 10, maximum: 60 })
    dailyLearningGoalInMinutes: number;

    @ApiProperty()
    bio : string;

    @ApiProperty()
    photoUrl : string;

    @ApiProperty()
    personalTrophyQuantity : number;

    @ApiProperty()
    cityTrophyQuantity : number;

    @ApiProperty()
    globalTrophyQuantity : number;

    @ApiProperty()
    totalTrophyQuantity : number;
    

}

export class UserInvitationsCodes {

    @ApiProperty({example : '11111111-1111-1111-1111-111111111111'})
    id : string;

    @ApiProperty({example : '1234'})
    invitationCode : number;

    @ApiProperty({example : 'true'})
    type : string;

    @ApiProperty({example : true})
    active : boolean;

    @ApiProperty({ example : "2021-08-26T21:57:24.365Z"})
    createdAt : string;

    @ApiProperty({ example : "2021-08-26T21:57:24.365Z"})
    updatedAt : string;
}

export class InvitationCodeValidateDto {

    @ApiProperty({ enum: ['valid', 'invalid'], example : 'valid'})
    status : string;
    
}

export class UserDailyGoalStatsDto {

    @ApiProperty({ description: "User id" })
    id : string;

    @ApiProperty({ description: "User-configured daily goal" })
    dailyGoalInMinutes : number;

    @ApiProperty({ description: "End time to meet daily goal" })
    dailyGoalEndsAt : Date;

    @ApiProperty({ description: "Indicates whether the daily goal was achieved or not" })
    dailyGoalAchieved : boolean;

    @ApiProperty({ description: "Daily goal time achieved so far (Format: 00h 00m 00s)" })
    totalAppUsageTimeSoFar : string;

    @ApiProperty({ description: "Daily goal time achieved so far in milliseconds" })
    totalAppUsageTimeSoFarInMs : number;

    @ApiProperty({ description: "Total OOZ accumulated so far" })
    accumulatedOOZ : number;

    @ApiProperty({ description: "Percentage of daily goal achieved" })
    percentageOfDailyGoalAchieved : number;

}

export class UserProfileUpdateDto {

    @ApiProperty()
    id: string;

    @ApiProperty()
    fullname: string;

    @ApiProperty()
    countryCode: string;

    @ApiProperty()
    languages: string

    @ApiProperty()
    dialCode: string;

    @ApiProperty()
    phone: string;

    @ApiProperty({ required: false })
    bio: string;

    @ApiProperty({ required: false, type: "file", description: "User photo" })
    file : object;

    @ApiProperty({ example : "1993/07/08", description: "User birthdate in format YYYY/MM/DD" })
    birthdate : string;

    @ApiProperty({type: "number", minimum: 10, maximum: 60})
    dailyLearningGoalInMinutes : number;

    @ApiProperty({ required: false })
    addressCountryCode : string;

    @ApiProperty({ required: false })
    addressState : string;
    
    @ApiProperty({ required: false })
    addressCity : string;

    @ApiProperty({ required: false })
    addressLatitude : number;

    @ApiProperty({ required: false })
    addressLongitude : number;

    @ApiProperty({ required: false, description: "IDs of selected tags separated by commas"})
    tagsIds : string;

    @ApiProperty({ required: false, description: "this field is received in JSON format"})
    links : [UserLinks];
}

export class UsersAppUsageTimeDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    timeInMilliseconds : number;

}

export enum LangsEnum {
    ptbr = "pt-BR",
    en = "en",
    fr = "fr"
}