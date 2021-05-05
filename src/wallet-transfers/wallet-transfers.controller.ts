import { Controller, Get, HttpException, Param, Query, Req, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { WalletTransfersService } from './wallet-transfers.service';
import { WalletTransfersDto, WalletTransfersHistoryDto } from './wallet-transfers.dto';

@Controller('wallet-transfers')
export class WalletTransfersController {

    constructor(
        private readonly walletTransfersService : WalletTransfersService) {}

    //TODO: Remover este endpoint, serve apenas para testes
    @UseInterceptors(SentryInterceptor)
    @ApiTags('wallet-transfers')
    @ApiParam({ name : "userId", type: "string", description: "User ID" })
    @ApiOperation({ summary: "Performs a transfer to the user's wallet" })
    @ApiResponse({ status: 200, type: WalletTransfersDto })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @Get('/:userId')
    async createTransferTest(@Param('userId') userId) {
        try {
            return await this.walletTransfersService.createTransfer(userId, 50);
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('wallet-transfers')
    @ApiParam({ name : "userId", type: "string", description: "User ID" })
    @ApiOperation({ summary: "Returns the user's transaction history" })
    @ApiBearerAuth('Bearer')
    @ApiQuery({ name : "limit", type: "number", description: "Limit of transfers (50 max.)", required: false })
    @ApiQuery({ name : "offset", type: "number", required: false })
    @ApiResponse({ status: 200, type: WalletTransfersHistoryDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Get('/:userId/history')
    async getHistory(@Param('userId') userId) {
        try {

            return [
                {
                    id : "debdbcac-deb0-4c4a-92e9-669c6613c1f9",
                    userId : "17ffcc4a-a96d-43fa-a0cc-3eda164c0b03",
                    walletId : "87b5dfdd-72d6-48e6-a5d9-b1215b76b964",
                    originUserId : "00851c9d-fb60-40b5-8ab2-91bb59bd8163",
                    originUserName : "Claudio Oliveira",
                    origin : "video_like",
                    action : "received",
                    balance : 12.3,
                    createdAt : new Date(),
                    updatedAt : new Date(),
                },
                {
                    id : "debdbcac-deb0-4c4a-92e9-669c6613c1f9",
                    userId : "17ffcc4a-a96d-43fa-a0cc-3eda164c0b03",
                    walletId : "87b5dfdd-72d6-48e6-a5d9-b1215b76b964",
                    originUserId : "00851c9d-fb60-40b5-8ab2-91bb59bd8163",
                    originUserName : "Claudio Oliveira",
                    origin : "video_like",
                    action : "received",
                    balance : 10.75,
                    createdAt : "2021-03-10 15:40:09",
                    updatedAt : "2021-03-10 15:40:09",
                },
                {
                    id : "debdbcac-deb0-4c4a-92e9-669c6613c1f9",
                    userId : "17ffcc4a-a96d-43fa-a0cc-3eda164c0b03",
                    walletId : "87b5dfdd-72d6-48e6-a5d9-b1215b76b964",
                    originUserId : "00851c9d-fb60-40b5-8ab2-91bb59bd8163",
                    originUserName : "Claudio Oliveira",
                    origin : "video_like",
                    action : "received",
                    balance : 3.5,
                    createdAt : "2021-03-10 15:40:09",
                    updatedAt : "2021-03-10 15:40:09",
                },
                {
                    id : "debdbcac-deb0-4c4a-92e9-669c6613c1f9",
                    userId : "17ffcc4a-a96d-43fa-a0cc-3eda164c0b03",
                    walletId : "87b5dfdd-72d6-48e6-a5d9-b1215b76b964",
                    originUserId : "",
                    originUserName : "",
                    origin : "video_like",
                    action : "sent",
                    balance : 3.5,
                    createdAt : "2021-04-15 12:22:15",
                    updatedAt : "2021-04-15 12:22:15",
                },
            ];

        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
