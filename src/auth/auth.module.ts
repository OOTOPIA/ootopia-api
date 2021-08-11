import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './constants';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { JwtResetPasswordStrategy } from './jwt-reset-password.strategy';
import { EmailsService } from '../emails/emails.service';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UsersModule),
  ],
  providers: [JwtStrategy, JwtResetPasswordStrategy, AuthService, EmailsService],
  exports: [AuthService],
})
export class AuthModule {}
