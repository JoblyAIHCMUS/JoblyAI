import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { GcsService } from './gcs.service';
import { AuthGuard } from '../auth/auth.guard';
import { GenerateUploadUrlDTO } from '../s3/dto/generateUploadUrlDTO';
import { GenerateDownloadUrlDTO } from '../s3/dto/generateDownloadUrlDTO';
import { DeleteFileDTO } from '../s3/dto/deleteFileDTO';
import { GcsFolder } from './gcs.interface';

@Controller('gcs')
@UseGuards(AuthGuard)
export class GcsController {
  constructor(private readonly gcsService: GcsService) {}

  @Post('presigned-upload')
  @HttpCode(200)
  async generatePresignedUploadUrl(@Body() dto: GenerateUploadUrlDTO) {
    return this.gcsService.generatePresignedUploadUrl(
      dto.fileName,
      dto.fileType,
      (dto.folder as unknown as GcsFolder) || GcsFolder.RESUMES
    );
  }

  @Post('presigned-download')
  @HttpCode(200)
  async generatePresignedDownloadUrl(@Body() dto: GenerateDownloadUrlDTO) {
    return this.gcsService.generatePresignedDownloadUrl(
      dto.fileKey,
      dto.expiresIn
    );
  }

  @Delete('file')
  @HttpCode(200)
  async deleteFile(@Body() dto: DeleteFileDTO) {
    return this.gcsService.deleteFile(dto.fileKey);
  }
}
