import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badges } from './entities/badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badges)
    private badgesRepository: Repository<Badges>,
) {}

  findAll() {
    return this.badgesRepository.find();
  }

  findOne(id: string) {
    return this.badgesRepository.findOne(id)
  }
}
