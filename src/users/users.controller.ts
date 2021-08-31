import { Body, Controller, Get, HttpException, Post, Put, Request, Param, Headers, Query, HttpCode, HttpStatus, UseGuards, UseInterceptors, UploadedFile, Req, Inject, forwardRef } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ErrorHandling } from 'src/config/error-handling';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { CreatedUserDto, CreateUserDto, LoggedUserDto, RecoverPasswordDto, ResetPasswordDto, UserDailyGoalStatsDto, UserLoginDto, UserProfileDto, UserProfileUpdateDto, UsersAppUsageTimeDto, UserInvitationsCodes, InvitationCodeValidateDto } from './users.dto';
import { UsersService } from './users.service';
import { memoryStorage } from 'multer';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { UsersAppUsageTimeService } from './services/users-app-usage-time/users-app-usage-time.service';
import { DailyGoalDistributionHandlerService } from 'src/sqs-worker/daily-goal-distribution-handler/daily-goal-distribution-handler.service';
import { InvitationsCodesService } from 'src/invitations-codes/invitations-codes.service';
//import { JwtResetPasswordStrategy } from 'src/auth/jwt-reset-password.strategy';


@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService : UsersService,
        private readonly authService : AuthService,
        private readonly usersAppUsageTimeService : UsersAppUsageTimeService,
        private readonly invitationsCodesService : InvitationsCodesService,
        @Inject(forwardRef(() => DailyGoalDistributionHandlerService)) private readonly dailyGoalDistributionHandlerService : DailyGoalDistributionHandlerService,
        ) {}

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiOperation({ summary: 'Create a new user account' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 200, description: 'Successfully registered', type: CreatedUserDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Post()
    async createUser(@Request() req: Request, @Body() user : CreateUserDto) {
        try {
            return await this.usersService.createUser(user);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiOperation({ summary: 'Login' })
    @ApiBody({ type: UserLoginDto })
    @ApiResponse({ status: 200, description: 'Successfully logged in ', type: LoggedUserDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Post('/login')
    @HttpCode(200)
    async login(@Body() loginData : UserLoginDto) {
        try {

            if (!loginData) {
                throw new HttpException({ status: 400, error: "Invalid Body" }, 400);
            }

            return this.authService.validateUser(loginData.email, loginData.password);

        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiOperation({ summary: 'Send reset password email' })
    @ApiBody({ type: RecoverPasswordDto })
    @ApiResponse({ status: 200, description: 'Successfully logged in '})
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Post('/recover-password')
    @HttpCode(200)
    async recoverPassword(@Body() recoverPasswordData : RecoverPasswordDto) {
        try {

            if (!recoverPasswordData) {
                throw new HttpException({ status: 400, error: "Invalid Body" }, 400);
            }

            return this.authService.recoverPassword(recoverPasswordData.email);

        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiOperation({ summary: 'Update user´s password' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Successfully updated', type: ResetPasswordDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })    
    @UseGuards(AuthGuard('jwt-reset-password'))   
    @Post('/reset-password')
    @HttpCode(200)
    async updateUserPassword(@Req() { user }, @Body() password : ResetPasswordDto) {
       try{
            if(!password) {
                throw { status: '400', message: 'Invalid body'};
            }
            if(!user) {
                throw { status: '400', message: 'Invalid request'};
            }
          return this.usersService.resetPassword(user.id , password.password);        
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiOperation({ summary: 'Update user account' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: UserProfileUpdateDto })
    @ApiParam({ name : "id", type: "string", description: "User ID" })
    @ApiResponse({ status: 200, description: 'Successfully updated', type: CreatedUserDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @ApiConsumes('multipart/form-data')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
    }))
    @Put('/:id')
    async updateUser(@Param('id') id, @UploadedFile() file, @Req() { user }, @Body() body : UserProfileUpdateDto) {
        try {
            if (user.id != id) {
                throw new HttpException('User Not Authorized', 403);
            }
            var userData : any = body;
            userData.id = user.id;
            
            return await this.usersService.updateUser(userData, file);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiOperation({ summary: 'Update user dialog opened' })
    @ApiBearerAuth('Bearer')
    @ApiParam({ name : "id", type: "string", description: "User ID" })
    @ApiParam({ name : "type", type: "string", description: "Type of dialog from users that will be updated", enum: [ 'personal', 'city', 'global' ] })
    @ApiResponse({ status: 200, description: 'Successfully updated', type: CreatedUserDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Put('/:id/dialog-opened/:type')
    async updateDialogOpened(@Param('id') id, @Param('type') type, @Req() { user }) {
        try {
            if (user.id != id) {
                throw new HttpException('User Not Authorized', 403);
            }
            
            return await this.usersService.putDialogOpened(id, type);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiOperation({ summary: 'Get public details for a specific user' })
    @ApiParam({name : "id", type: "string", description: "User ID" })
    @ApiResponse({ status: 200, type: UserProfileDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Get('/:id/profile')
    async getUserProfile(@Param('id') id) {
        try {
            return await this.usersService.getUserProfile(id);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: "Get data from the logged-in user, endpoint used to update local data on the user's device" })
    @ApiResponse({ status: 200, type: UserProfileDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Get()
    async getUser(@Req() { user }) {
        try {
            return await this.usersService.getUserById(user.id);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: "Get user daily goal stats" })
    @ApiParam({ name : "id", type: "string", description: "User ID" })
    @ApiResponse({ status: 200, type: UserDailyGoalStatsDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Get('/:id/daily-goal-stats')
    async getUserDailyGoalStats(@Param('id') id, @Req() { user }) {
        try {
            if (user.id != id) {
                throw new HttpException('User Not Authorized', 403);
            }
            return await this.usersService.getUserDailyGoalStats(user.id);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: "Record the time the user used the app" })
    @ApiParam({ name : "id", type: "string", description: "User ID" })
    @ApiBody({ type: UsersAppUsageTimeDto })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Post('/usage-time')
    async recordTimeUserUsedApp(@Req() { user }, @Body() data) {
        try {
            data.userId = user.id;
            return await this.usersAppUsageTimeService.recordAppUsageTime(data);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiBearerAuth('Bearer')
    @ApiParam({ name : "id", type: "string", description: "User ID" })
    @ApiOperation({ summary: "Force daily goal checking for a user." })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Get('/:id/force-daily-goal-check')
    async forceDailyGoalCheck(@Param('id') id, @Req() { user }) {
        try {
            if (user.id != id) {
                throw new HttpException('User Not Authorized', 403);
            }
            return await this.dailyGoalDistributionHandlerService.startCheckingUsersDailyGoal([id]);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'Get public details for a specific user' })
    @ApiParam({name : "id", type: "string", description: "User ID" })
    @ApiResponse({ status: 200, type: UserInvitationsCodes })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Get('/:id/invitation-code')
    async getInvitationsCode(@Param('id') id, @Req() { user }) {
        try {
            if (user.id != id) {
                throw new HttpException('User Not Authorized', 403);
            }
            return await this.invitationsCodesService.getInvitationsCodesByUserId(id);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('users')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'Validate if invitation code exists' })
    @ApiParam({name : "code", type: "string", description: "Invitation Code to validate" })
    @ApiResponse({ status: 200, type: InvitationCodeValidateDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Get('/invitation-code/:code')
    async validateInvitationCode(@Param('code') code) {
        try {
            return await this.invitationsCodesService.validateInvitationCode(code);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
