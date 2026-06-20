import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { gcsStorage, gcsConfig } from '../../lib/gcs';
import { randomUUID } from 'crypto';
import {
  GcsPresignedUploadUrl,
  GcsPresignedDownloadUrl,
  GcsFolder,
  ALLOWED_FILE_TYPES,
  GCS_KEY_PREFIX_BY_FOLDER,
} from './gcs.interface';

@Injectable()
export class GcsService {
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

  private getBucket(folderOrKey: GcsFolder | string) {
    if (
      folderOrKey === GcsFolder.RESUMES ||
      (typeof folderOrKey === 'string' && folderOrKey.startsWith('resumes/'))
    ) {
      return gcsStorage.bucket(gcsConfig.privateBucketName);
    }
    return gcsStorage.bucket(gcsConfig.publicBucketName);
  }

  async generatePresignedUploadUrl(
    fileName: string,
    fileType: string,
    folder: GcsFolder = GcsFolder.RESUMES
  ): Promise<GcsPresignedUploadUrl> {
    this.validateFileType(fileType, folder);

    const fileExtension = this.getExtensionFromMimeType(fileType);
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    const keyPrefix = GCS_KEY_PREFIX_BY_FOLDER[folder];
    const fileKey = `${keyPrefix}/${uniqueFileName}`;

    const bucket = this.getBucket(folder);
    const file = bucket.file(fileKey);

    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + gcsConfig.uploadExpiry * 1000,
      contentType: fileType,
    });

    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      fileUrl,
      expiresIn: gcsConfig.uploadExpiry,
    };
  }

  async deleteFile(
    fileKey: string
  ): Promise<{ success: boolean; message: string }> {
    if (!fileKey || fileKey.trim().length === 0) {
      throw new BadRequestException('File key is required');
    }

    try {
      const bucket = this.getBucket(fileKey);
      await bucket.file(fileKey).delete();

      return {
        success: true,
        message: `File "${fileKey}" deleted successfully from GCS`,
      };
    } catch (error: unknown) {
      const gcsError = error as { code?: number; message?: string };
      if (gcsError.code === 404) {
        return {
          success: true,
          message: `File "${fileKey}" not found in GCS, skipping deletion`,
        };
      }
      throw new InternalServerErrorException(
        `Failed to delete file "${fileKey}" from GCS: ${gcsError.message}`
      );
    }
  }

  async generatePresignedDownloadUrl(
    fileKey: string,
    expiresIn = 3600
  ): Promise<GcsPresignedDownloadUrl> {
    if (!fileKey || fileKey.trim().length === 0) {
      throw new BadRequestException('File key is required');
    }

    try {
      const bucket = this.getBucket(fileKey);
      const [downloadUrl] = await bucket.file(fileKey).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });

      return {
        downloadUrl,
        expiresIn,
      };
    } catch (error: unknown) {
      const gcsError = error as { message?: string };
      throw new NotFoundException(
        `Failed to generate GCS download URL: ${gcsError.message}`
      );
    }
  }

  async getFileBuffer(fileKey: string): Promise<Buffer> {
    if (!fileKey || fileKey.trim().length === 0) {
      throw new BadRequestException('File key is required');
    }

    try {
      const bucket = this.getBucket(fileKey);
      const [buffer] = await bucket.file(fileKey).download();
      return buffer;
    } catch (error: unknown) {
      const gcsError = error as { message?: string };
      throw new NotFoundException(
        `Failed to get GCS file buffer: ${gcsError.message}`
      );
    }
  }

  private validateFileType(fileType: string, folder: GcsFolder): void {
    const allowed = ALLOWED_FILE_TYPES[folder];
    if (!allowed.includes(fileType)) {
      throw new BadRequestException(
        `File type "${fileType}" is not allowed for folder "${folder}"`
      );
    }
  }

  private getExtensionFromMimeType(fileType: string): string {
    const extension = this.extensionByMimeType[fileType];
    if (!extension) {
      throw new BadRequestException(`Unsupported MIME type "${fileType}"`);
    }
    return extension;
  }
}
