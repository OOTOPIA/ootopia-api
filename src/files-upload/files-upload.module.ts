import { Module } from '@nestjs/common';
import { FilesUploadService } from './files-upload.service';

@Module({
  providers: [FilesUploadService],
  exports: [FilesUploadService]
})
export class FilesUploadModule {}
