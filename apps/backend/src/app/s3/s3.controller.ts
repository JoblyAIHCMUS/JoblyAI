import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { S3Service } from './s3.service';
import { AuthGuard } from '../auth/auth.guard';
import { GenerateUploadUrlDTO } from './dto/generateUploadUrlDTO';
import { DeleteFileDTO } from './dto/deleteFileDTO';
import { S3Folder } from './s3.interface';

@Controller('s3')
@UseGuards(AuthGuard)
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  /**
   * GET PRESIGNED UPLOAD URL
   *
   * POST /api/s3/presigned-upload
   *
   * Body: {
   *   fileName: "resume.pdf",
   *   fileType: "application/pdf",
   *   folder: "resumes",
   *   maxSizeMB: 5
   * }
   *
   * Response: {
   *   uploadUrl: "https://...",
   *   fileKey: "resumes/uuid.pdf",
   *   publicUrl: "https://...",
   *   expiresIn: 300
   * }
   */
  @Post('presigned-upload')
  @HttpCode(200)
  async generatePresignedUploadUrl(@Body() dto: GenerateUploadUrlDTO) {
    return this.s3Service.generatePresignedUploadUrl(
      dto.fileName,
      dto.fileType,
      dto.folder || S3Folder.RESUMES
    );
  }

  /**
   *
   * DELETE /api/s3/file
   *
   * Body: {
   *   fileKey: "resumes/uuid.pdf"
   * }
   *
   * Response: {
   *   success: true,
   *   message: "File deleted successfully"
   * }
   *
   * Use case:
   * - User updates resume → delete old file
   * - User removes avatar → clean up S3
   */
  @Delete('file')
  @HttpCode(200)
  async deleteFile(@Body() dto: DeleteFileDTO) {
    return this.s3Service.deleteFile(dto.fileKey);
  }
}
