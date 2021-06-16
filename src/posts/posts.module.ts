import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsRepository } from './posts.repository';
import { VideoModule } from 'src/video/video.module';
import { CommentsService } from './services/comments.service';
import { CommentsRepository } from './repositories/comments.repository';
import { AddressesRepository } from 'src/addresses/addresses.repository';
import { InterestsTagsModule } from 'src/interests-tags/interests-tags.module';
import { CitiesModule } from 'src/cities/cities.module';
import { GeneralConfigModule } from 'src/general-config/general-config.module';
import { WalletTransfersModule } from 'src/wallet-transfers/wallet-transfers.module';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostsRepository,
      CommentsRepository,
      AddressesRepository,
    ]),
    WalletsModule,
    forwardRef(() => WalletsModule),
    forwardRef(() => WalletTransfersModule),
    VideoModule,
    InterestsTagsModule,
    CitiesModule,
    GeneralConfigModule,
  ],
  providers: [PostsService, CommentsService],
  controllers: [PostsController],
  exports: [PostsService]
})
export class PostsModule {}
