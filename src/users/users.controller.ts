import { Body, Controller, Get, HttpException, Post, Put, Request, Param, Headers, Query, HttpCode, HttpStatus, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ErrorHandling } from 'src/config/error-handling';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { CreatedUserDto, CreateUserDto, LoggedUserDto, RecoverPasswordDto, ResetPasswordDto, UserLoginDto, UserProfileDto, UserProfileUpdateDto } from './users.dto';
import { UsersService } from './users.service';
import { memoryStorage } from 'multer';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
//import { JwtResetPasswordStrategy } from 'src/auth/jwt-reset-password.strategy';


@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService : UsersService,
        private readonly authService : AuthService
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
    @ApiOperation({ summary: 'Update user account' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: UserProfileUpdateDto })
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
    @ApiOperation({ summary: 'Update user´s password' })
    @ApiBearerAuth('Bearer')
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Successfully updated', type: ResetPasswordDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })    
    @UseGuards(AuthGuard('jwt-reset-password'))   
    @Post('/reset-password')
    async updateUserPassword(@Req() { user }, @Body() password : ResetPasswordDto) {
        console.log(user);
       try{
        if(!password) {
            throw { status: '400', message: 'Invalid body'};
        }
          return this.usersService.resetPassword(user.id , password.password);        
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

}
