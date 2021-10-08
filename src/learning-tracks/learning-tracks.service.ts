import { HttpException, Injectable } from '@nestjs/common';
import { LearningTracksFilterDto } from './learning-tracks.dto';
import { LearningTracksRepository } from './learning-tracks.repository';
import * as moment from 'moment-timezone';
import { FilesUploadService } from 'src/files-upload/files-upload.service';
import * as Axios from 'axios';
import { VideoService } from 'src/video/video.service';
import { PostsService } from 'src/posts/posts.service';
import { GeneralConfigService } from 'src/general-config/general-config.service';
import { ConfigName } from 'src/general-config/general-config.entity';

const axios = Axios.default;

@Injectable()
export class LearningTracksService {

    constructor(
        private readonly learningTracksRepository : LearningTracksRepository,
        private readonly filesUploadService: FilesUploadService,
        private readonly videoService: VideoService,
        private readonly generalConfigService: GeneralConfigService,
        ) {

    }

    async createOrUpdate(learningTrackData, strapiEvent : string) {

        let findLearningTrack = await this.learningTracksRepository.getByStrapiId(learningTrackData.id);

        if (strapiEvent == "entry.update" && (!findLearningTrack || !learningTrackData.published_at)) { 
            //Não vamos fazer nada se houver atualização sem que o dado esteja registrado no banco e publicado no strapi
            return;
        }

        let uploadNewImage = learningTrackData.photo != null;
        let photoUrl = learningTrackData.photo ? (learningTrackData.photo.formats?.large?.url || learningTrackData.photo.formats?.medium?.url || learningTrackData.photo.formats?.small?.url || learningTrackData.photo.formats?.thumbnail?.url) : ""; 
        let imageUrl = learningTrackData.photo ? `${process.env.STRAPI_URL}${photoUrl}` : "";

        if (findLearningTrack) {
            let strapiId = learningTrackData.id;
            uploadNewImage = learningTrackData.photo && moment(learningTrackData.photo.updated_at) > moment(findLearningTrack.imageUpdatedAt);
            learningTrackData.id = findLearningTrack.id;
            learningTrackData.strapiId = strapiId;
            imageUrl = learningTrackData.imageUrl;
        }else{
            learningTrackData.strapiId = learningTrackData.id;
            delete learningTrackData.id;
        }

        if (uploadNewImage && imageUrl) {
            let fileBuffer = (await axios.get(imageUrl, { responseType : 'arraybuffer' })).data;
            imageUrl = await this.filesUploadService.uploadLearningTrackImageToS3(fileBuffer, imageUrl);
        }

        let learningTrack : any = {
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
            location : learningTrackData.location || "",
            time : "",
            ooz : 0,
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
                    delete chapter.tittle;
                    chapter.videoUrl = videoDetails.playback.hls;
                    chapter.videoThumbUrl = videoDetails.thumbnail;
                    chapter.time = this.msToTime(videoDetails.duration * 1000); //convert duration to ms and get formatted time
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

        return await this.learningTracksRepository.createOrUpdate(learningTrack);

    }

    async getLearningTracks(filters : LearningTracksFilterDto) {
        let learningTracks : any = await this.learningTracksRepository.getLearningTracks(filters);
        return learningTracks.map(this.mapper);
    }

    async getLastLearningTrack(locale : string) {
        let filters : LearningTracksFilterDto = {
            limit: 1,
            locale,
        };
        let learningTracks : any = await this.learningTracksRepository.getLearningTracks(filters);
        return (learningTracks.length ? learningTracks.map(this.mapper)[0] : null);
    }

    private mapper(learningTrack) {
        if (!learningTrack.userId) {
            learningTrack.userId = "ootopia";
            learningTrack.userName = "OOTOPIA";
            learningTrack.userPhotoUrl = "https://ootopia-files-staging.s3.sa-east-1.amazonaws.com/ootopia_marketplace_icon.png";
        }
        learningTrack.ooz = +learningTrack.ooz;
        return learningTrack;
    }

    async deleteLearningTrack(strapiId) {
        await this.learningTracksRepository.deleteLearningTrack(strapiId);
    }

    private msToTime(duration) {

        var seconds : any = Math.floor((duration / 1000) % 60),
          minutes : any = Math.floor((duration / (1000 * 60)) % 60),
          hours : any = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
      
        return (+hours ? hours + "h " : "") + (+minutes ? minutes + "m " : (+hours ? "00m " : "")) + seconds + "s";

    }

    async calcOOZToTransferForChapter(durationInSecs) {
        const oozToReward = +(
            await this.generalConfigService.getConfig(
                ConfigName.LEARNING_TRACK_PER_MINUTE_OF_WATCHED_VIDEO,
            )
        ).value;
        const duration = +(durationInSecs).toFixed(0);
        return +((oozToReward * (duration / 60)).toFixed(2));
    }

    private mapperChapter(chapter) {
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

        await this.learningTracksRepository.markChapterCompleted(learningTrackId, chapter.id, userId);

        

    }

}
