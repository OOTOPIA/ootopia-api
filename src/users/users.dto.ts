import { IsNotEmpty, min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Double } from 'typeorm';

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

    @ApiProperty()
    countryCode: string;

    @ApiProperty()
    dialCode: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    bio: string;

    @ApiProperty({ required: true, type: "file", description: "User photo" })
    file : object;

    @ApiProperty({ example : "1993-07-08", description: "User birthdate in format YYYY-MM-DD" })
    birthdate : Date;

    @ApiProperty({type: "number", minimum: 10, maximum: 60})
    dailyLearningGoalInMinutes : number;

    @ApiProperty()
    addressCountryCode : string;

    @ApiProperty()
    addressState : string;
    
    @ApiProperty()
    addressCity : string;

    @ApiProperty()
    addressLatitude : number;

    @ApiProperty()
    addressLongitude : number;

    @ApiProperty({description: "IDs of selected tags separated by commas"})
    tagsIds : string;
    
    @ApiProperty({ required: false})
    invitationCode : string;
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

export class ResetPasswordDto {
           
    @ApiProperty({ required: true })
    @IsNotEmpty()
    password : string;   
  
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
    dialCode: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    bio: string;

    @ApiProperty({ required: true, type: "file", description: "User photo" })
    file : object;

    @ApiProperty({ example : "1993-07-08", description: "User birthdate in format YYYY-MM-DD" })
    birthdate : string;

    @ApiProperty({type: "number", minimum: 10, maximum: 60})
    dailyLearningGoalInMinutes : number;

    @ApiProperty()
    addressCountryCode : string;

    @ApiProperty()
    addressState : string;
    
    @ApiProperty()
    addressCity : string;

    @ApiProperty()
    addressLatitude : number;

    @ApiProperty()
    addressLongitude : number;

    @ApiProperty({description: "IDs of selected tags separated by commas"})
    tagsIds : string;

}

export class UsersAppUsageTimeDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    timeInMilliseconds : number;

}