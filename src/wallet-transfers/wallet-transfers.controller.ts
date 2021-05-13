import { Controller, Get, Post, Body, HttpException, Param, Query, Req, UseInterceptors, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { WalletTransfersService } from './wallet-transfers.service';
import { WalletTransfersDto, WalletTransfersFilterDto, WalletTransfersHistoryDto, WalletTransferToPostDto } from './wallet-transfers.dto';
import { Origin, WalletTransferAction } from './wallet-transfers.entity';

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
            return await this.walletTransfersService.createTransfer(userId, { balance : 50, origin : Origin.TRANSFER, action: WalletTransferAction.RECEIVED });
        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('wallet-transfers')
    @ApiOperation({ summary: 'Transfer OOZ to the author of a specific post' })
    @ApiBearerAuth('Bearer')
    @ApiParam({ name : "postId", type: "string", description: "Post ID" })
    @ApiBody({ type: WalletTransferToPostDto })
    @ApiResponse({ status: 200, description: 'Successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto})
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Post('/post/:postId/transfer')
    @HttpCode(200)
    async transferOOZFromPost(@Req() { user }, @Param('postId') postId, @Body() data : WalletTransferToPostDto) {
        try {

            await this.walletTransfersService.transferToPostAuthor(user.id, postId, data.balance);

        } catch (error) {
            new ErrorHandling(error);
        }
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('wallet-transfers')
    @ApiParam({ name : "userId", type: "string", description: "User ID" })
    @ApiOperation({ summary: "Returns the user's transaction history" })
    @ApiBearerAuth('Bearer')
    @ApiQuery({ name : "action", enum: ['sent', 'received'], required: false })
    @ApiQuery({ name : "limit", type: "number", description: "Limit of transfers (50 max.)", required: false })
    @ApiQuery({ name : "offset", type: "number", required: false })
    @ApiResponse({ status: 200, type: WalletTransfersHistoryDto, isArray: true })
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: 'Internal Server Error', type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Get('/:userId/history')
    async getHistory(@Param('userId') userId, @Req() req, @Query() filters : WalletTransfersFilterDto) {
        try {

            return await this.walletTransfersService.getTransfers(Object.assign(filters, { userId }));

        } catch (error) {
            new ErrorHandling(error);
        }
    }

}
