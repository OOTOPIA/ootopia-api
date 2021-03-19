import { Test, TestingModule } from '@nestjs/testing';
import { FilesUploadService } from './files-upload.service';

describe('FilesUploadService', () => {
  let service: FilesUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesUploadService],
    }).compile();

    service = module.get<FilesUploadService>(FilesUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
