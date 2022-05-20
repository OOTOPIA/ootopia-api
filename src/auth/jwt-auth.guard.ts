import { ExecutionContext, Injectable, UnauthorizedException, HttpException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private usersService: UsersService) {
        super();
    }
    canActivate(context: ExecutionContext) {
        // Add your custom authentication logic here
        // for example, call super.logIn(request) to establish a session.
        return super.canActivate(context);
    }
    // @ts-ignore: Unreachable code error
    async handleRequest(err, user, info) {
        let findUser = await this.usersService.getUserByEmail(user.email)
        if (findUser.bannedAt) {
            throw new HttpException(
                {
                    status: 401,
                    error: `Not Authorized`,
                },
                401,
            );
        }
        return user;
    }

}
