import { Controller, Get, HttpException, Param, Query, Req, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
import { WalletsDto } from './wallets.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('wallets')
export class WalletsController {

    constructor(
        private readonly walletsService : WalletsService) {}

    @UseInterceptors(SentryInterceptor)
    @ApiTags('wallets')
    @ApiParam({ name : "userId", type: "string", description: "User ID" })
    @ApiOperation({ summary: 'Return a user wallet' })
    @ApiBearerAuth('Bearer')
    @ApiResponse({ status: 200, type: WalletsDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Get('/:userId')
    async getWallet(@Param('userId') userId, @Req() { user }) {
        try {

            //throw new HttpException('User Not Authorized', 403);

            if (user.id != userId) {
                throw new HttpException('User Not Authorized', 403);
            }

            return await this.walletsService.getWalletByUserId(userId);
            
        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
