import { Injectable, BadRequestException } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, s3Config } from '../../lib/s3';
import { randomUUID } from 'crypto';
import {
  PresignedUploadUrl,
  S3Folder,
  ALLOWED_FILE_TYPES,
} from './s3.interface';

@Injectable()
export class S3Service {
  /**
   * Generate presigned URL
   *
   * Flows
   * 1. Validate file type (PDF for resumes, images for avatars/logos)
   * 2. Generate unique filename (UUID + extension)
   * 3. Create presigned URL with AWS SDK (PUT method, content type, size limit)
   * 4. Return uploadUrl + publicUrl + fileKey + expiry time to frontend
   *
   * Frontend will use uploadUrl to upload file directly to S3, then save publicUrl/fileKey in DB for later access
   */
  async generatePresignedUploadUrl(
    fileName: string,
    fileType: string,
    folder: S3Folder = S3Folder.RESUMES,
  ): Promise<PresignedUploadUrl> {
    // Validate file type
    this.validateFileType(fileType, folder);

    // Generate unique filename
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    const fileKey = `${folder}/${uniqueFileName}`;

    // Create presigned URL
    const command = new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: fileKey,
      ContentType: fileType,
      // Note: Removed ContentLength to allow any file size up to maxSizeMB
      // AWS S3 will accept files <= maxSizeMB, validation should be done on frontend
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: s3Config.uploadExpiry, // 5 minutes
    });

    // Create public URL for accessing the file
    const publicUrl = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      publicUrl, 
      expiresIn: s3Config.uploadExpiry,
    };
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
}
