import { HttpException, Injectable } from '@nestjs/common';
import { LearningTracksFilterDto, LearningTrackDto, ChapterDto } from './learning-tracks.dto';
import { LearningTracksRepository } from './learning-tracks.repository';
import * as moment from 'moment-timezone';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import * as Axios from 'axios';
import { VideoService } from 'src/video/video.service';
import { PostsService } from 'src/posts/posts.service';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { ConfigName } from 'src/general-config/general-config.entity';
import { LearningTrackCompletedChaptersRepository } from './repositories/learning-track-completed-chapters.repository';
import { WalletTransfersService } from 'src/wallet-transfers/wallet-transfers.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { UsersService } from 'src/users/users.service';
import * as Sentry from '@sentry/node';
import { LinksService } from 'src/links/links.service';
import { LearningTracks } from './learning-tracks.entity';

const axios = Axios.default;

@Injectable()
export class LearningTracksService {

    constructor(
        private readonly learningTracksRepository : LearningTracksRepository,
        private readonly linksService : LinksService,
        private readonly learningTrackCompletedChaptersRepository : LearningTrackCompletedChaptersRepository,
        private readonly filesUploadService: FilesUploadService,
        private readonly videoService: VideoService,
        private readonly generalConfigService: GeneralConfigService,
        private readonly walletsService: WalletsService,
        private readonly walletTransfersService: WalletTransfersService,
        private usersService : UsersService,
        ) {

    }
    
    async createOrUpdate(learningTrackData, strapiEvent : string) {

        let findLearningTrack = await this.learningTracksRepository.getByStrapiId(learningTrackData.id);

        if (strapiEvent == "entry.update" && (!findLearningTrack || !learningTrackData.published_at)) {
            //Não vamos fazer nada se houver atualização sem que o dado esteja registrado no banco e publicado no strapi
            return;
        }

        let uploadNewImage = learningTrackData.photo != null;
        let photoUrl = learningTrackData.photo ? (
            learningTrackData.photo.formats?.large?.url || 
            learningTrackData.photo.formats?.medium?.url || 
            learningTrackData.photo.formats?.small?.url || 
            learningTrackData.photo.formats?.thumbnail?.url ||
            learningTrackData.photo.formats?.url || 
            learningTrackData.photo.url
        ) : ""; 
        let imageUrl = learningTrackData.photo ? `${process.env.STRAPI_URL}${photoUrl}` : "";

        if (findLearningTrack) {
            let strapiId = learningTrackData.id;
            uploadNewImage = learningTrackData.photo && moment(learningTrackData.photo.updated_at) > moment(findLearningTrack.imageUpdatedAt);
            learningTrackData.id = findLearningTrack.id;
            learningTrackData.strapiId = strapiId;
        }else{
            learningTrackData.strapiId = learningTrackData.id;
            delete learningTrackData.id;
        }

        if (uploadNewImage && imageUrl) {
            let fileBuffer = (await axios.get(imageUrl, { responseType : 'arraybuffer' })).data;
            imageUrl = await this.filesUploadService.uploadLearningTrackImageToS3(fileBuffer, imageUrl);
        }

        let learningTrack : LearningTrackDto = {
            id : learningTrackData.id,
            strapiId : learningTrackData.strapiId,
            title : learningTrackData.title,
            description : learningTrackData.description || "",
            locale : learningTrackData.locale,
            imageUrl : imageUrl,
            imageUpdatedAt  : learningTrackData.photo ? learningTrackData.photo.updated_at : null,
            chapters : learningTrackData.episode || [],
            createdAt : learningTrackData.created_at,
            updatedAt : learningTrackData.updated_at,
            hashtagsStrapiId: learningTrackData.hashtagsStrapiId,
            location : learningTrackData.location || "",
            time : "",
            ooz : 0,
            showAtTimeline : !!learningTrackData.show_at_timeline,
            deletedAt : null,
        };

        let totalDurationInSecs = 0;

        for (let i = 0; i < learningTrack.chapters.length; i++) {
            let chapter = learningTrack.chapters[i];
            if (chapter.video) {
                try {
                    let videoDetails = (
                        await this.videoService.getVideoDetails(chapter.video)
                    ).result;
                    delete chapter.title;
                    chapter.videoUrl = videoDetails.playback.hls;
                    chapter.videoThumbUrl = videoDetails.thumbnail;
                    chapter.time = this.msToTime(videoDetails.duration * 1000).replace("m ", "min "); //convert duration to ms and get formatted time
                    chapter.ooz = await this.calcOOZToTransferForChapter(videoDetails.duration);
                    learningTrack.ooz += chapter.ooz;
                    totalDurationInSecs += videoDetails.duration;
                    chapter = this.mapperChapter(chapter);
                }catch(err) {
                    console.log("Error when get video details " + chapter.video, err);
                    throw err;
                }
            }
        }

        learningTrack.time = this.msToTime(totalDurationInSecs * 1000);

        try {

            if (learningTrackData.author) {
      
              let user = await this.usersService.getUserByEmail(learningTrackData.author);
      
              if (user) {
                learningTrack.userId = user.id;
              }else{
                Sentry.captureMessage("There is no author with this email: " + learningTrackData.author);
              }
            }
        }catch(e) {
            Sentry.captureException(e);
        }

        return await this.learningTracksRepository.createOrUpdate(learningTrack);

    }

    async getLearningTracks(filters: LearningTracksFilterDto, userId? : string) {
        let learningTracks : any = await this.learningTracksRepository.getLearningTracks(filters);

        let learningTracksIds : string[] = learningTracks.map((data) => data.id);

        if (learningTracks.length && userId) {
            let chapters = await this.learningTrackCompletedChaptersRepository.getCompletedChaptersOfLearningTracks(learningTracksIds, userId);
            learningTracks.forEach((learningTrack) => {
                let learningTrackCompletedChapters = chapters.filter((c) => c.learningTrackId == learningTrack.id);
                learningTrack.completed = (learningTrackCompletedChapters.length == learningTrack.chapters.length && learningTrack.chapters.length > 0);
                learningTrack.chapters.forEach((chapter) => {
                    chapter.completed = (chapters.filter((c) => +c.chapterId == +chapter.id).length > 0);
                    chapter.time = chapter.time.replace("m ", "min ");
                });
            });
        }else{
            learningTracks.forEach((learningTrack) => {
                learningTrack.completed = false;
                learningTrack.chapters.forEach((chapter) => {
                    chapter.completed = false;
                    chapter.time = chapter.time.replace("m ", "min ");
                });
            });
        }

        return learningTracks.map(this.mapper);
    }

    async getLearningTracksById(id : string ) {
        return (await this.getLearningTracks({ id }))[0];
    }

    async getLearningTracksByStrapiId(strapiId : string ) {
        return (await this.learningTracksRepository.getLearningTracks({strapiId})[0] || null);
    }

    async getWelcomeGuideLearningTrack(locale : string, userId : string) {
        let strapiId = locale == "en" ? "4" : "18";
        return (await this.getLearningTracks({ strapiId, locale }, userId))[0];
    }

    async getLastLearningTrack(locale : string, userId? : string) {
        let filters : LearningTracksFilterDto = {
            limit: 1,
            locale,
        };
        let learningTracks : any = await this.getLearningTracks(filters, userId);
        return (learningTracks.length ? learningTracks.map(this.mapper)[0] : null);
    }

    private mapper(learningTrack: LearningTrackDto) {
        if (!learningTrack.userId) {
            learningTrack.userId = "ootopia";
            learningTrack.userName = "OOTOPIA";
            learningTrack.userPhotoUrl = "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_marketplace_icon.png";
        }
        learningTrack.ooz = +learningTrack.ooz;
        learningTrack.time = learningTrack.time.replace("m ", "min ");;
        return learningTrack;
    }

    async deleteLearningTrack(strapiId: number) {
        return await this.learningTracksRepository.deleteLearningTrack(strapiId);
    }

    private msToTime(duration: number) {

        var seconds : any = Math.floor((duration / 1000) % 60),
          minutes : any = Math.floor((duration / (1000 * 60)) % 60),
          hours : any = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
      
        return (+hours ? hours + "h " : "") + (+minutes ? minutes + "min " : (+hours ? "00min " : "")) + seconds + "s";

    }

    async calcOOZToTransferForChapter(durationInSecs: number) {
        const oozToReward = +(
            await this.generalConfigService.getConfig(
                ConfigName.LEARNING_TRACK_PER_MINUTE_OF_WATCHED_VIDEO,
            )
        ).value;
        const duration = +(durationInSecs).toFixed(0);
        return +((oozToReward * (duration / 60)).toFixed(2));
    }

    private mapperChapter(chapter: ChapterDto) {
        return {
            id : chapter.id,
            title : chapter.title,
            videoUrl : chapter.videoUrl,
            videoThumbUrl : chapter.videoThumbUrl,
            time : chapter.time,
            ooz : chapter.ooz,
            completed : chapter.completed || false,
            createdAt : chapter.createdAt,
            updatedAt : chapter.updatedAt,
        }
    }

    async markLearningTrackChapterCompleted(learningTrackId : string, chapterId : string, userId : string) {

        let learningTrack = await this.learningTracksRepository.getById(learningTrackId);

        if (!learningTrack) {
            throw new HttpException("LEARNING_TRACK_NOT_FOUND", 400);
        }

        let chapter = learningTrack.chapters.filter((c) => c.id == chapterId);

        if (!chapter.length) {
            throw new HttpException("CHAPTER_NOT_FOUND", 400);
        }

        chapter = chapter[0];

        var result = await this.learningTracksRepository.markChapterCompleted(learningTrackId, chapter.id, userId);

        //Se vier vazio, é porque o capitulo já foi marcado como completo, então não precisamos fazer nada
        
        if (result.length) {

            let wallet = await this.walletsService.getWalletByUserId(userId);

            let learningTrackTransfers = await this.walletTransfersService.getTransfers({
                walletId : wallet.id,
                learningTrackId : learningTrackId
            });

            if (!learningTrackTransfers.length) {
                await this.walletTransfersService.transferLearningTrack(chapter.ooz || 0, learningTrack, userId, wallet);
            }else{
                await this.walletTransfersService.updateLearningTrackTransfer(chapter.ooz || 0, learningTrackTransfers[0], userId, wallet);
            }

        }

    }

    async getLearningTrackSharedLink(learningTrackId: string) {
        let learningTrack = await this.learningTracksRepository.getById(learningTrackId);
        
        return this.linksService.linkForShared({
            title: learningTrack.title,
            description: learningTrack.description,
            imageUrl: learningTrack.imageUrl,
        });
    }

}
