import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

// Hoisted mocks for GCS client
const { mockBucket, mockGetSignedUrl, mockDelete, mockDownload } = vi.hoisted(
  () => {
    const mockGetSignedUrl = vi.fn();
    const mockDelete = vi.fn();
    const mockDownload = vi.fn();
    const mockFile = vi.fn().mockReturnValue({
      getSignedUrl: mockGetSignedUrl,
      delete: mockDelete,
      download: mockDownload,
    });
    const mockBucket = vi.fn().mockReturnValue({
      name: 'test-bucket',
      file: mockFile,
    });
    return { mockBucket, mockFile, mockGetSignedUrl, mockDelete, mockDownload };
  }
);

// Mock @google-cloud/storage
vi.mock('@google-cloud/storage', () => {
  return {
    Storage: class {
      bucket = mockBucket;
    },
  };
});

import { GcsService } from '../app/gcs/gcs.service';
import { GcsFolder } from '../app/gcs/gcs.interface';
import { gcsConfig } from '../lib/gcs';

describe('GcsService', () => {
  let service: GcsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GcsService],
    }).compile();

    service = module.get<GcsService>(GcsService);
    vi.clearAllMocks();
  });

  describe('generatePresignedUploadUrl', () => {
    it('should generate upload URL successfully for valid file type and folder', async () => {
      mockGetSignedUrl.mockResolvedValue(['https://gcs-signed-url']);

      const result = await service.generatePresignedUploadUrl(
        'my-resume.pdf',
        'application/pdf',
        GcsFolder.RESUMES
      );

      expect(result).toBeDefined();
      expect(result.uploadUrl).toBe('https://gcs-signed-url');
      expect(result.fileKey).toMatch(/^resumes\/[0-9a-f-]+\.pdf$/);
      expect(result.fileUrl).toContain(`https://storage.googleapis.com/`);
      expect(result.fileUrl).toContain(result.fileKey);
      expect(result.expiresIn).toBe(gcsConfig.uploadExpiry);
      expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
    });

    it('should reject invalid MIME types', async () => {
      await expect(
        service.generatePresignedUploadUrl(
          'doc.gif',
          'image/gif',
          GcsFolder.RESUMES
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockDelete.mockResolvedValue([{}]);

      const result = await service.deleteFile('resumes/uuid.pdf');

      expect(result).toEqual({
        success: true,
        message: 'File "resumes/uuid.pdf" deleted successfully from GCS',
      });
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('should skip deletion and return success when file is not found (404)', async () => {
      const notFoundError = new Error('Not Found');
      (notFoundError as any).code = 404;
      mockDelete.mockRejectedValue(notFoundError);

      const result = await service.deleteFile('resumes/not-exist.pdf');

      expect(result).toEqual({
        success: true,
        message:
          'File "resumes/not-exist.pdf" not found in GCS, skipping deletion',
      });
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockDelete.mockRejectedValue(new Error('Connection failure'));

      await expect(service.deleteFile('resumes/uuid.pdf')).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('generatePresignedDownloadUrl', () => {
    it('should generate download URL successfully', async () => {
      mockGetSignedUrl.mockResolvedValue(['https://gcs-download-url']);

      const result = await service.generatePresignedDownloadUrl(
        'resumes/uuid.pdf',
        3600
      );

      expect(result).toEqual({
        downloadUrl: 'https://gcs-download-url',
        expiresIn: 3600,
      });
    });

    it('should throw NotFoundException on error', async () => {
      mockGetSignedUrl.mockRejectedValue(new Error('Permission denied'));

      await expect(
        service.generatePresignedDownloadUrl('resumes/uuid.pdf')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFileBuffer', () => {
    it('should get file buffer successfully', async () => {
      const mockBuffer = Buffer.from('test pdf content');
      mockDownload.mockResolvedValue([mockBuffer]);

      const result = await service.getFileBuffer('resumes/uuid.pdf');

      expect(result).toBe(mockBuffer);
      expect(mockDownload).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException on error', async () => {
      mockDownload.mockRejectedValue(new Error('File not readable'));

      await expect(service.getFileBuffer('resumes/uuid.pdf')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
