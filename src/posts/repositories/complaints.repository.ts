import { HttpException, Injectable } from "@nestjs/common";
import { EntityRepository, Repository, UpdateResult, getConnection } from "typeorm";
import { PostsTimelineViewTime } from "../entities/posts-timeline-view-time.entity";
import * as camelcaseKeys from 'camelcase-keys';
import { Complaints } from '../entities/complaints.entity';
import { ComplaintCreateDTO } from '../posts.dto';

@Injectable()
@EntityRepository(Complaints)
export class ComplaintsRepository extends Repository<Complaints>{

    constructor() {
        super();
    }

    async createComplaint(data: ComplaintCreateDTO): Promise<Complaints> {
        let complaint = this.create()
        Object.assign(complaint, data);

        return await this.save(complaint);
    }

}