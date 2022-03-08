import { Controller, Post, Put, Query, Req, Param, Delete, UseInterceptors, UseGuards, Get } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HttpResponseDto } from '../config/http-response.dto';
import { JwtOptionalAuthGuard } from '../auth/jwt-optional-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FriendByUser, FriendsWithPosts, SearchFriends, SearchNotFriends } from './dto/friends.dto';

@UseGuards(JwtOptionalAuthGuard)
@Controller('friends')
export class FriendsController {
    constructor(
        private readonly friendService: FriendsService
    ) {}
    @UseInterceptors(SentryInterceptor)
    @ApiTags('friends')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'Send friend follow' })
    @ApiResponse({ status: 200, description: 'Successfully add friend '})
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Post('/:friendId')
    async addFriend(
        @Req() { user },
        @Param('friendId') friendId: string
    ) {
        return await this.friendService.addFriend(user.id, friendId)
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('friends')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'Remove friend follow' })
    @ApiResponse({ status: 200, description: 'Successfully remove friend '})
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Delete('/:friendId')
    async removeFriend(
        @Req() { user },
        @Param('friendId') friendId: string
    ) {
        return await this.friendService.removeFriend(user.id, friendId)
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('friends')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'List not friends by user' })
    @ApiResponse({ status: 200, description: 'Successfully List', type: FriendByUser})
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Get("/search")
    async getFriendsByUser(
        @Req() { user },
        @Query() filter: SearchNotFriends
    ) {
        return this.friendService.searchNotFriends({userId: user.id ,...filter});
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('friends')
    @ApiOperation({ summary: 'List all friends of user' })
    @ApiResponse({ status: 200, description: 'Successfully List', type: FriendsWithPosts})
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Get("/:userId")
    async searchFriends(
        @Param('userId') userId: string,
        @Query() filter: SearchFriends
    ) {
        return await this.friendService.searchFriendsByUser({userId ,...filter});
    }
 }
