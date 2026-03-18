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
import { GenerateDownloadUrlDTO } from './dto/generateDownloadUrlDTO';
import { DeleteFileDTO } from './dto/deleteFileDTO';
import { S3Folder } from './s3.interface';

@Controller('s3')
@UseGuards(AuthGuard)
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  /**
   * CREATE PRESIGNED UPLOAD URL
   *
   * POST /api/s3/presigned-upload
   *
   * Body: {
   *   fileName: "resume.pdf",
   *   fileType: "application/pdf",
   *   folder: "resumes"
   * }
   *
   * Notes:
   * - file key extension is derived from validated MIME type, not fileName.
   *
   * Response: {
   *   uploadUrl: "https://...",
   *   fileKey: "resumes/uuid.pdf",
   *   fileUrl: "https://...",
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
   * CREATE PRESIGNED DOWNLOAD URL
   *
   * POST /api/s3/presigned-download
   *
   * Body: {
   *   fileKey: "resumes/uuid.pdf",
   *   expiresIn: 3600  // Optional: seconds (default 3600 = 1 hour)
   * }
   *
   * Response: {
   *   downloadUrl: "https://...?X-Amz-Signature=...",
   *   expiresIn: 3600
   * }
   *
   * Use case:
   * - Employer views candidate resume securely
   * - User downloads their files with time-limited access
   * - Required when bucket has Block Public Access enabled
   */
  @Post('presigned-download')
  @HttpCode(200)
  async generatePresignedDownloadUrl(@Body() dto: GenerateDownloadUrlDTO) {
    return this.s3Service.generatePresignedDownloadUrl(
      dto.fileKey,
      dto.expiresIn
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
