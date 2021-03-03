import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
    dailyLearningGoalInMinutes : number;

    @ApiProperty()
    enableSustainableAds : boolean;

    @ApiProperty({ description: "Generated JWT to use on HTTP Headers Authorization" })
    token : string;

    @ApiProperty()
    createdAt : Date;

    @ApiProperty()
    updatedAt : Date;

}