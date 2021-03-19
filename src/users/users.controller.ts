import { Body, Controller, Get, HttpException, Post, Put, Request, Param, Headers, Query, HttpCode, HttpStatus, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ErrorHandling } from 'src/config/error-handling';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { CreatedUserDto, CreateUserDto, LoggedUserDto, UserLoginDto, UserProfileDto, UserProfileUpdateDto } from './users.dto';
import { UsersService } from './users.service';
import { memoryStorage } from 'multer'

@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService : UsersService,
        private readonly authService : AuthService
        ) {}

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
            console.log("TESTE", body, file);
            var userData : any = body;
            userData.id = user.id;
            return await this.usersService.updateUser(userData, file);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

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

}
