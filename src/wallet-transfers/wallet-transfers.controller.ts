import { Controller, Get, HttpException, Param, Query, Req, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiExcludeEndpoint, ApiParam, ApiTags } from '@nestjs/swagger';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { ErrorHandling } from './../config/error-handling';
import { HttpResponseDto } from './../config/http-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { WalletTransfersService } from './wallet-transfers.service';
import { WalletTransfersDto } from './wallet-transfers.dto';

@Controller('wallet-transfers')
export class WalletTransfersController {

    constructor(
        private readonly walletTransfersService : WalletTransfersService) {}

    //TODO: Remover este endpoint, serve apenas para testes
    @UseInterceptors(SentryInterceptor)
    @ApiTags('wallet-transfers')
    @ApiParam({ name : "userId", type: "string", description: "User ID" })
    @ApiOperation({ summary: 'Performs a transfer to the user\'s wallet' })
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

}
