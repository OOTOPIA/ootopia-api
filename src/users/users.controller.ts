import { Body, Controller, Get, HttpException, Post, Put, Request, Param, Headers, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { ErrorHandling } from 'src/config/error-handling';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { CreatedUserDto, CreateUserDto, LoggedUserDto, UserLoginDto } from './users.dto';
import { UsersService } from './users.service';

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

}
