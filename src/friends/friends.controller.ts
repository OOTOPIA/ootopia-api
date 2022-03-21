import { Controller, Post, Put, Query, Req, Param, Delete, UseInterceptors, UseGuards, Get } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { SentryInterceptor } from '../interceptors/sentry.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HttpResponseDto } from '../config/http-response.dto';
import { JwtOptionalAuthGuard } from '../auth/jwt-optional-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FriendByUser, FriendsWithPosts, FriendsWithPostsAndIsFriend, IsFriend, SearchFriends, SearchFriendsOfUsers, SearchNotFriends } from './dto/friends.dto';

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
        return this.friendService.searchFriendsByUser({userId: user.id ,...filter});
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('friends')
    @ApiOperation({ summary: 'List all friends of user' })
    @ApiResponse({ status: 200, description: 'Successfully List', type: FriendsWithPosts})
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Get("/by-user/:userId")
    async searchFriends(
        @Param('userId') userId: string,
        @Query() filter: SearchFriends
    ) {
        return await this.friendService.friendsByUser({userId ,...filter});
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('friends')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'List all friends of user' })
    @ApiResponse({ status: 200, description: 'Successfully List', type: FriendsWithPostsAndIsFriend})
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @Get("/search-by-friends")
    async searchFriendsByFriends(
        @Req() { user },
        @Query() filter: SearchFriendsOfUsers
    ) {
        return await this.friendService.friendsByfriends({...filter, userId: filter.friendId, friendId: user.id});
    }

    @UseInterceptors(SentryInterceptor)
    @ApiTags('friends')
    @ApiBearerAuth('Bearer')
    @ApiOperation({ summary: 'is friend ' })
    @ApiResponse({ status: 200, description: 'true or false ', type: IsFriend})
    @ApiResponse({ status: 400, description: 'Bad Request', type: HttpResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden', type: HttpResponseDto })
    @ApiResponse({ status: 500, description: "Internal Server Error", type: HttpResponseDto })
    @UseGuards(JwtAuthGuard)
    @Get("/:friendId")
    async isFriend(
        @Req() { user },
        @Param('friendId') friendId: string,
    ) {
        return await this.friendService.isFriend(friendId, user.id);
    }
 }
