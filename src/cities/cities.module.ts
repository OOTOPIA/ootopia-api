import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitiesService } from './cities.service';
import { CitiesRepository } from './cities.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([CitiesRepository]),
    ],
    providers: [CitiesService],
    exports: [CitiesService]
})
export class CitiesModule {}
