import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UseGuards, HttpCode, Req } from '@nestjs/common';
import { UsersDeviceTokenService } from './users-device-token.service';
import { CreateUsersDeviceTokenDto, DeviceTokenDTO } from './dto/create-users-device-token.dto';
import { UpdateUsersDeviceTokenDto } from './dto/update-users-device-token.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SentryInterceptor } from 'src/interceptors/sentry.interceptor';
import { HttpResponseDto } from 'src/config/http-response.dto';
import { ErrorHandling } from 'src/config/error-handling';

@Controller('users-device-token')
export class UsersDeviceTokenController {
  constructor(private readonly usersDeviceTokenService: UsersDeviceTokenService) {}

  @UseInterceptors(SentryInterceptor)
  @ApiTags('users-device-token')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: DeviceTokenDTO })
  @ApiResponse({ status: 200, description: 'updateed token device ' })
  @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
  @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
  @ApiBearerAuth('Bearer')
  @UseGuards(JwtAuthGuard)
  @Put('/')
  @HttpCode(200)
  async updateTokenDevice(@Req() { user }, @Body() body: DeviceTokenDTO) {
      try {
          return this.usersDeviceTokenService.updateTokenDeviceUser(user.id, body.deviceToken, body.deviceId);

      } catch (error) {
          new ErrorHandling(error);
      }
  }

}
