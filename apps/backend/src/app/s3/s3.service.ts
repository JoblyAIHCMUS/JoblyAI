import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, s3Config } from '../../lib/s3';
import { randomUUID } from 'crypto';
import {
  PresignedUploadUrl,
  PresignedDownloadUrl,
  S3Folder,
  ALLOWED_FILE_TYPES,
  S3_KEY_PREFIX_BY_FOLDER,
} from './s3.interface';

@Injectable()
export class S3Service {
  private readonly extensionByMimeType: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  };

  /**
   * Generate presigned URL
   *
   * Flows
   * 1. Validate file type (PDF for resumes, images for avatars/logos)
   * 2. Generate unique filename (UUID + extension)
   * 3. Create presigned URL with AWS SDK (PUT method, content type)
   * 4. Return uploadUrl + fileUrl + fileKey + expiry time to frontend
   *
   * Frontend will use uploadUrl to upload file directly to S3, then save fileUrl/fileKey in DB.
   * NOTE: fileUrl is an S3 object URL that requires bucket public access OR use generatePresignedDownloadUrl() for secure access.
   */
  async generatePresignedUploadUrl(
    fileName: string,
    fileType: string,
    folder: S3Folder = S3Folder.RESUMES
  ): Promise<PresignedUploadUrl> {
    // Validate file type
    this.validateFileType(fileType, folder);

    // Build key extension from validated MIME type instead of trusting fileName.
    const fileExtension = this.getExtensionFromMimeType(fileType);
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    const keyPrefix = S3_KEY_PREFIX_BY_FOLDER[folder];
    const fileKey = `${keyPrefix}/${uniqueFileName}`;

    // Create presigned URL
    const command = new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: s3Config.uploadExpiry, // 5 minutes
    });

    // Create S3 object URL
    // NOTE: This URL requires bucket public access to be viewable directly.
    // For private buckets, use generatePresignedDownloadUrl() to create time-limited access URLs.
    const fileUrl = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      fileUrl,
      expiresIn: s3Config.uploadExpiry,
    };
  }

  /**
   * 🗑️ DELETE - Remove file from S3
   *
   * Use case:
   * - User updates resume → delete old file before uploading new one
   * - User removes avatar → delete from S3
   * - Clean up unused files
   *
   * @param fileKey - S3 key (e.g., "resumes/uuid.pdf")
   */
  async deleteFile(
    fileKey: string
  ): Promise<{ success: boolean; message: string }> {
    if (!fileKey || fileKey.trim().length === 0) {
      throw new BadRequestException('File key is required');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: fileKey,
      });

      await s3Client.send(command);

      return {
        success: true,
        message: `File "${fileKey}" deleted successfully`,
      };
    } catch (error: unknown) {
      const awsError = error as {
        $metadata?: { httpStatusCode?: number };
        message?: string;
        name?: string;
      };
      const statusCode = awsError.$metadata?.httpStatusCode;
      const errorMessage = awsError.message || 'Unknown error';
      const errorName = String(awsError.name || '').toLowerCase();
      const lowerMessage = String(errorMessage).toLowerCase();
      const baseMessage = `Failed to delete file "${fileKey}". Error: ${errorMessage}`;

      if (statusCode === 403) {
        throw new ForbiddenException(baseMessage);
      }

      if (typeof statusCode === 'number' && statusCode >= 500) {
        throw new ServiceUnavailableException(baseMessage);
      }

      const isTransientNetworkError =
        errorName.includes('timeout') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('timed out') ||
        lowerMessage.includes('econn') ||
        lowerMessage.includes('network') ||
        lowerMessage.includes('socket');

      if (isTransientNetworkError) {
        throw new ServiceUnavailableException(baseMessage);
      }

      throw new InternalServerErrorException(baseMessage);
    }
  }

  /**
   * GENERATE PRESIGNED DOWNLOAD URL
   *
   * Creates a time-limited URL for downloading/viewing a file from S3.
   * Use this when bucket has Block Public Access enabled.
   *
   * Use case:
   * - Employer views candidate resume (secure access)
   * - User views their own uploaded files
   * - Share files with expiring links
   *
   * @param fileKey - S3 object key (e.g., "resumes/uuid.pdf")
   * @param expiresIn - URL expiry time in seconds (default: 3600 = 1 hour)
   */
  async generatePresignedDownloadUrl(
    fileKey: string,
    expiresIn = 3600
  ): Promise<PresignedDownloadUrl> {
    if (!fileKey || fileKey.trim().length === 0) {
      throw new BadRequestException('File key is required');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: s3Config.bucketName,
        Key: fileKey,
      });

      const downloadUrl = await getSignedUrl(s3Client, command, {
        expiresIn,
      });

      return {
        downloadUrl,
        expiresIn,
      };
    } catch (error: unknown) {
      const awsError = error as { message?: string };
      throw new NotFoundException(
        `Failed to generate download URL for "${fileKey}". Error: ${
          awsError.message || 'Unknown error'
        }`
      );
    }
  }

  private validateFileType(fileType: string, folder: S3Folder): void {
    const allowed = ALLOWED_FILE_TYPES[folder];

    if (!allowed.includes(fileType)) {
      throw new BadRequestException(
        `File type "${fileType}" is not allowed for folder "${folder}". ` +
          `Only the following types are allowed: ${allowed.join(', ')}`
      );
    }
  }

  private getExtensionFromMimeType(fileType: string): string {
    const extension = this.extensionByMimeType[fileType];

    if (!extension) {
      throw new BadRequestException(
        `Cannot determine file extension for MIME type "${fileType}"`
      );
    }

    return extension;
  }
}
