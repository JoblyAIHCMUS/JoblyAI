import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

// Hoisted mock functions
const mockSend = vi.hoisted(() => vi.fn());
const mockGetSignedUrl = vi.hoisted(() => vi.fn());

// Mock AWS SDK client FIRST - before lib/s3 imports it
vi.mock('@aws-sdk/client-s3', () => {
  class MockS3Client {
    constructor(config: Record<string, unknown>) {
      void config;
    }
    send = mockSend;
  }

  class MockPutObjectCommand {
    constructor(public input: Record<string, unknown>) {}
  }

  class MockGetObjectCommand {
    constructor(public input: Record<string, unknown>) {}
  }

  class MockDeleteObjectCommand {
    constructor(public input: Record<string, unknown>) {}
  }

  return {
    S3Client: MockS3Client,
    PutObjectCommand: MockPutObjectCommand,
    GetObjectCommand: MockGetObjectCommand,
    DeleteObjectCommand: MockDeleteObjectCommand,
  };
});

// Mock AWS SDK presigner
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}));

// Import after mocks are set up
import { S3Service } from '../app/s3/s3.service';
import { S3Folder } from '../app/s3/s3.interface';

describe('S3Service - Integration Tests', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
    vi.clearAllMocks();
  });

  describe('generatePresignedUploadUrl', () => {
    it('should generate presigned URL for PDF resume upload', async () => {
      // Arrange
      const mockSignedUrl =
        'https://test-bucket.s3.amazonaws.com/presigned-url?signature=abc123';
      mockGetSignedUrl.mockResolvedValue(mockSignedUrl);

      // Act
      const result = await service.generatePresignedUploadUrl(
        'my-resume.pdf',
        'application/pdf',
        S3Folder.RESUMES
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.uploadUrl).toBe(mockSignedUrl);
      expect(result.fileKey).toMatch(/^resumes\/[0-9a-f-]+\.pdf$/);
      expect(result.fileUrl).toContain('.s3.ap-southeast-1.amazonaws.com');
      expect(result.fileUrl).toContain(result.fileKey);
      expect(result.expiresIn).toBe(300);
      expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
    });

    it('should generate presigned URL for JPEG avatar upload', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');

      // Act
      const result = await service.generatePresignedUploadUrl(
        'profile.jpg',
        'image/jpeg',
        S3Folder.AVATARS
      );

      // Assert
      expect(result.fileKey).toMatch(/^avatars\/[0-9a-f-]+\.jpg$/);
      expect(result.fileUrl).toContain('avatars/');
    });

    it('should generate presigned URL for PNG avatar upload', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');

      // Act
      const result = await service.generatePresignedUploadUrl(
        'avatar.png',
        'image/png',
        S3Folder.AVATARS
      );

      // Assert
      expect(result.fileKey).toMatch(/^avatars\/[0-9a-f-]+\.png$/);
    });

    it('should generate presigned URL for WEBP avatar upload', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');

      // Act
      const result = await service.generatePresignedUploadUrl(
        'modern-avatar.webp',
        'image/webp',
        S3Folder.AVATARS
      );

      // Assert
      expect(result.fileKey).toMatch(/^avatars\/[0-9a-f-]+\.webp$/);
    });

    it('should generate presigned URL for SVG company logo', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');

      // Act
      const result = await service.generatePresignedUploadUrl(
        'company-logo.svg',
        'image/svg+xml',
        S3Folder.LOGOS
      );

      // Assert
      expect(result.fileKey).toMatch(/^logos\/[0-9a-f-]+\.svg$/);
      expect(result.fileUrl).toContain('logos/');
    });

    it('should generate presigned URL for DOC resume', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');

      // Act
      const result = await service.generatePresignedUploadUrl(
        'old-format.doc',
        'application/msword',
        S3Folder.RESUMES
      );

      // Assert
      expect(result.fileKey).toMatch(/^resumes\/[0-9a-f-]+\.doc$/);
    });

    it('should generate presigned URL for DOCX resume', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');

      // Act
      const result = await service.generatePresignedUploadUrl(
        'modern-format.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        S3Folder.RESUMES
      );

      // Assert
      expect(result.fileKey).toMatch(/^resumes\/[0-9a-f-]+\.docx$/);
    });

    it('should default to RESUMES folder when folder not specified', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');

      // Act
      const result = await service.generatePresignedUploadUrl(
        'document.pdf',
        'application/pdf'
      );

      // Assert
      expect(result.fileKey).toMatch(/^resumes\//);
    });

    it('should generate unique file keys for different uploads', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');

      // Act
      const result1 = await service.generatePresignedUploadUrl(
        'same-name.pdf',
        'application/pdf',
        S3Folder.RESUMES
      );

      const result2 = await service.generatePresignedUploadUrl(
        'same-name.pdf',
        'application/pdf',
        S3Folder.RESUMES
      );

      const result3 = await service.generatePresignedUploadUrl(
        'same-name.pdf',
        'application/pdf',
        S3Folder.RESUMES
      );

      // Assert
      expect(result1.fileKey).not.toBe(result2.fileKey);
      expect(result2.fileKey).not.toBe(result3.fileKey);
      expect(result1.fileKey).not.toBe(result3.fileKey);
    });

    it('should preserve file extension correctly', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');

      // Act & Assert
      const pdf = await service.generatePresignedUploadUrl(
        'file.pdf',
        'application/pdf'
      );
      expect(pdf.fileKey).toMatch(/\.pdf$/);

      const doc = await service.generatePresignedUploadUrl(
        'file.doc',
        'application/msword'
      );
      expect(doc.fileKey).toMatch(/\.doc$/);

      const docx = await service.generatePresignedUploadUrl(
        'file.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      expect(docx.fileKey).toMatch(/\.docx$/);

      const jpg = await service.generatePresignedUploadUrl(
        'avatar.jpg',
        'image/jpeg',
        S3Folder.AVATARS
      );
      expect(jpg.fileKey).toMatch(/\.jpg$/);

      const png = await service.generatePresignedUploadUrl(
        'avatar.png',
        'image/png',
        S3Folder.AVATARS
      );
      expect(png.fileKey).toMatch(/\.png$/);

      const webp = await service.generatePresignedUploadUrl(
        'avatar.webp',
        'image/webp',
        S3Folder.AVATARS
      );
      expect(webp.fileKey).toMatch(/\.webp$/);

      const svg = await service.generatePresignedUploadUrl(
        'logo.svg',
        'image/svg+xml',
        S3Folder.LOGOS
      );
      expect(svg.fileKey).toMatch(/\.svg$/);
    });

    describe('File Type Validation', () => {
      it('should reject image file for resumes folder', async () => {
        // Act & Assert
        await expect(
          service.generatePresignedUploadUrl(
            'image.jpg',
            'image/jpeg',
            S3Folder.RESUMES
          )
        ).rejects.toThrow(BadRequestException);

        await expect(
          service.generatePresignedUploadUrl(
            'image.png',
            'image/png',
            S3Folder.RESUMES
          )
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject document files for avatars folder', async () => {
        // Act & Assert
        await expect(
          service.generatePresignedUploadUrl(
            'resume.pdf',
            'application/pdf',
            S3Folder.AVATARS
          )
        ).rejects.toThrow(BadRequestException);

        await expect(
          service.generatePresignedUploadUrl(
            'doc.docx',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            S3Folder.AVATARS
          )
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject document files for logos folder', async () => {
        // Act & Assert
        await expect(
          service.generatePresignedUploadUrl(
            'resume.pdf',
            'application/pdf',
            S3Folder.LOGOS
          )
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject unsupported file types with clear error message', async () => {
        // Act & Assert
        try {
          await service.generatePresignedUploadUrl(
            'video.mp4',
            'video/mp4',
            S3Folder.RESUMES
          );
          expect.fail('Should have thrown BadRequestException');
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          expect(error).toBeInstanceOf(BadRequestException);
          expect(message).toContain('File type');
          expect(message).toContain('not allowed');
          expect(message).toContain('video/mp4');
          expect(message).toContain('resumes');
        }
      });

      it('should reject GIF images for avatars', async () => {
        // Act & Assert
        await expect(
          service.generatePresignedUploadUrl(
            'animated.gif',
            'image/gif',
            S3Folder.AVATARS
          )
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject WEBP images for logos', async () => {
        // Act & Assert
        await expect(
          service.generatePresignedUploadUrl(
            'logo.webp',
            'image/webp',
            S3Folder.LOGOS
          )
        ).rejects.toThrow(BadRequestException);
      });

      it('should accept SVG for logos but reject for avatars', async () => {
        // Arrange
        mockGetSignedUrl.mockResolvedValue('https://signed-url');

        // Act & Assert - Should work for logos
        const logoResult = await service.generatePresignedUploadUrl(
          'logo.svg',
          'image/svg+xml',
          S3Folder.LOGOS
        );
        expect(logoResult).toBeDefined();

        // Should fail for avatars
        await expect(
          service.generatePresignedUploadUrl(
            'avatar.svg',
            'image/svg+xml',
            S3Folder.AVATARS
          )
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('Edge Cases', () => {
      it('should handle file names with multiple dots', async () => {
        // Arrange
        mockGetSignedUrl.mockResolvedValue('https://signed-url');

        // Act
        const result = await service.generatePresignedUploadUrl(
          'document.backup.final.pdf',
          'application/pdf'
        );

        // Assert
        expect(result.fileKey).toMatch(/\.pdf$/);
      });

      it('should handle file names with special characters', async () => {
        // Arrange
        mockGetSignedUrl.mockResolvedValue('https://signed-url');

        // Act
        const result = await service.generatePresignedUploadUrl(
          'résumé-年度報告-2024.pdf',
          'application/pdf'
        );

        // Assert
        expect(result).toBeDefined();
        expect(result.fileKey).toMatch(/\.pdf$/);
      });

      it('should handle very long file names', async () => {
        // Arrange
        mockGetSignedUrl.mockResolvedValue('https://signed-url');
        const longFileName = 'a'.repeat(200) + '.pdf';

        // Act
        const result = await service.generatePresignedUploadUrl(
          longFileName,
          'application/pdf'
        );

        // Assert
        expect(result).toBeDefined();
        expect(result.fileKey).toMatch(/\.pdf$/);
      });

      it('should handle file with no extension', async () => {
        // Arrange
        mockGetSignedUrl.mockResolvedValue('https://signed-url');

        // Act
        const result = await service.generatePresignedUploadUrl(
          'resume',
          'application/pdf'
        );

        // Assert
        expect(result).toBeDefined();
        expect(result.fileKey).toMatch(/^resumes\/[0-9a-f-]+\.pdf$/);
      });

      it('should derive extension from MIME type when fileName extension mismatches', async () => {
        // Arrange
        mockGetSignedUrl.mockResolvedValue('https://signed-url');

        // Act
        const result = await service.generatePresignedUploadUrl(
          'avatar.png',
          'image/jpeg',
          S3Folder.AVATARS
        );

        // Assert
        expect(result.fileKey).toMatch(/^avatars\/[0-9a-f-]+\.jpg$/);
      });
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully with valid fileKey', async () => {
      // Arrange
      mockSend.mockResolvedValue({});

      // Act
      const result = await service.deleteFile('resumes/test-uuid-123.pdf');

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'File "resumes/test-uuid-123.pdf" deleted successfully',
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should delete avatar files', async () => {
      // Arrange
      mockSend.mockResolvedValue({});

      // Act
      const result = await service.deleteFile('avatars/user-avatar.jpg');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('avatars/user-avatar.jpg');
    });

    it('should delete logo files', async () => {
      // Arrange
      mockSend.mockResolvedValue({});

      // Act
      const result = await service.deleteFile('logos/company-logo.svg');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('logos/company-logo.svg');
    });

    it('should delete multiple different files sequentially', async () => {
      // Arrange
      mockSend.mockResolvedValue({});

      // Act
      const result1 = await service.deleteFile('resumes/file1.pdf');
      const result2 = await service.deleteFile('avatars/file2.jpg');
      const result3 = await service.deleteFile('logos/file3.png');

      // Assert
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    describe('Error Handling', () => {
      it('should throw BadRequestException for empty fileKey', async () => {
        // Act & Assert
        await expect(service.deleteFile('')).rejects.toThrow(
          BadRequestException
        );
        await expect(service.deleteFile('   ')).rejects.toThrow(
          BadRequestException
        );
      });

      it('should throw BadRequestException for null fileKey', async () => {
        // Act & Assert
        await expect(
          service.deleteFile(null as unknown as string)
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException for undefined fileKey', async () => {
        // Act & Assert
        await expect(
          service.deleteFile(undefined as unknown as string)
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw InternalServerErrorException when S3 deletion fails with unknown error', async () => {
        // Arrange
        mockSend.mockRejectedValue(
          new Error('NoSuchKey: The specified key does not exist')
        );

        // Act & Assert
        await expect(
          service.deleteFile('resumes/non-existent.pdf')
        ).rejects.toThrow(InternalServerErrorException);
      });

      it('should include error message in ServiceUnavailableException', async () => {
        // Arrange
        mockSend.mockRejectedValue(new Error('S3 connection timeout'));

        // Act & Assert
        try {
          await service.deleteFile('resumes/timeout.pdf');
          expect.fail('Should have thrown ServiceUnavailableException');
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          expect(error).toBeInstanceOf(ServiceUnavailableException);
          expect(message).toContain('Failed to delete file');
          expect(message).toContain('resumes/timeout.pdf');
          expect(message).toContain('S3 connection timeout');
        }
      });

      it('should map AWS 403 to ForbiddenException', async () => {
        // Arrange
        mockSend.mockRejectedValue({
          name: 'AccessDenied',
          message: 'Access Denied',
          $metadata: {
            httpStatusCode: 403,
          },
        });

        // Act & Assert
        await expect(service.deleteFile('resumes/missing.pdf')).rejects.toThrow(
          ForbiddenException
        );
      });

      it('should map AWS 5xx to ServiceUnavailableException', async () => {
        // Arrange
        mockSend.mockRejectedValue({
          name: 'InternalError',
          message: 'S3 internal error',
          $metadata: {
            httpStatusCode: 503,
          },
        });

        // Act & Assert
        await expect(
          service.deleteFile('resumes/server-error.pdf')
        ).rejects.toThrow(ServiceUnavailableException);
      });

      it('should handle network errors', async () => {
        // Arrange
        mockSend.mockRejectedValue(new Error('Network error: ECONNREFUSED'));

        // Act & Assert
        await expect(
          service.deleteFile('resumes/network-fail.pdf')
        ).rejects.toThrow(ServiceUnavailableException);
      });
    });

    describe('Edge Cases', () => {
      it('should handle fileKeys with special characters', async () => {
        // Arrange
        mockSend.mockResolvedValue({});

        // Act
        const result = await service.deleteFile(
          'resumes/user-123/final-résumé-2024.pdf'
        );

        // Assert
        expect(result.success).toBe(true);
      });

      it('should handle very long fileKeys', async () => {
        // Arrange
        mockSend.mockResolvedValue({});
        const longFileKey = 'resumes/' + 'a'.repeat(500) + '.pdf';

        // Act
        const result = await service.deleteFile(longFileKey);

        // Assert
        expect(result.success).toBe(true);
      });

      it('should handle fileKeys with multiple slashes', async () => {
        // Arrange
        mockSend.mockResolvedValue({});

        // Act
        const result = await service.deleteFile(
          'resumes/2024/03/user-123/resume.pdf'
        );

        // Assert
        expect(result.success).toBe(true);
      });
    });
  });

  describe('generatePresignedDownloadUrl', () => {
    it('should generate presigned download URL with default expiry', async () => {
      // Arrange
      const mockDownloadUrl =
        'https://jobly-dev-assets.s3.amazonaws.com/resumes/test.pdf?X-Amz-Signature=xyz';
      mockGetSignedUrl.mockResolvedValue(mockDownloadUrl);

      // Act
      const result = await service.generatePresignedDownloadUrl(
        'resumes/test-uuid.pdf'
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.downloadUrl).toBe(mockDownloadUrl);
      expect(result.expiresIn).toBe(3600); // Default 1 hour
      expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
    });

    it('should generate presigned download URL with custom expiry', async () => {
      // Arrange
      const mockDownloadUrl = 'https://signed-download-url';
      mockGetSignedUrl.mockResolvedValue(mockDownloadUrl);

      // Act
      const result = await service.generatePresignedDownloadUrl(
        'avatars/user-avatar.jpg',
        7200 // 2 hours
      );

      // Assert
      expect(result.downloadUrl).toBe(mockDownloadUrl);
      expect(result.expiresIn).toBe(7200);
    });

    it('should generate download URLs for different file types', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');

      // Act
      const result1 = await service.generatePresignedDownloadUrl(
        'resumes/resume.pdf'
      );
      const result2 = await service.generatePresignedDownloadUrl(
        'avatars/avatar.jpg'
      );
      const result3 = await service.generatePresignedDownloadUrl(
        'logos/logo.svg'
      );

      // Assert
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result3).toBeDefined();
      expect(mockGetSignedUrl).toHaveBeenCalledTimes(3);
    });

    describe('Error Handling', () => {
      it('should throw BadRequestException for empty fileKey', async () => {
        // Act & Assert
        await expect(service.generatePresignedDownloadUrl('')).rejects.toThrow(
          BadRequestException
        );
        await expect(
          service.generatePresignedDownloadUrl('   ')
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException for null/undefined fileKey', async () => {
        // Act & Assert
        await expect(
          service.generatePresignedDownloadUrl(null as unknown as string)
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.generatePresignedDownloadUrl(undefined as unknown as string)
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw NotFoundException when S3 operation fails', async () => {
        // Arrange
        mockGetSignedUrl.mockRejectedValue(
          new Error('NoSuchKey: File does not exist')
        );

        // Act & Assert
        await expect(
          service.generatePresignedDownloadUrl('resumes/non-existent.pdf')
        ).rejects.toThrow(NotFoundException);
      });

      it('should include error message in NotFoundException', async () => {
        // Arrange
        mockGetSignedUrl.mockRejectedValue(new Error('Access Denied'));

        // Act & Assert
        try {
          await service.generatePresignedDownloadUrl('resumes/forbidden.pdf');
          expect.fail('Should have thrown NotFoundException');
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          expect(error).toBeInstanceOf(NotFoundException);
          expect(message).toContain('Failed to generate download URL');
          expect(message).toContain('resumes/forbidden.pdf');
          expect(message).toContain('Access Denied');
        }
      });
    });

    describe('Edge Cases', () => {
      it('should handle fileKeys with special characters', async () => {
        // Arrange
        mockGetSignedUrl.mockResolvedValue('https://signed-url');

        // Act
        const result = await service.generatePresignedDownloadUrl(
          'resumes/user-123/résumé-年度報告.pdf'
        );

        // Assert
        expect(result).toBeDefined();
        expect(result.downloadUrl).toBe('https://signed-url');
      });

      it('should handle very long fileKeys', async () => {
        // Arrange
        mockGetSignedUrl.mockResolvedValue('https://signed-url');
        const longFileKey = 'resumes/' + 'a'.repeat(500) + '.pdf';

        // Act
        const result = await service.generatePresignedDownloadUrl(longFileKey);

        // Assert
        expect(result).toBeDefined();
      });

      it('should handle different expiry times', async () => {
        // Arrange
        mockGetSignedUrl.mockResolvedValue('https://signed-url');

        // Act
        const result1 = await service.generatePresignedDownloadUrl(
          'resumes/test.pdf',
          60 // 1 minute
        );
        const result2 = await service.generatePresignedDownloadUrl(
          'resumes/test.pdf',
          86400 // 1 day
        );

        // Assert
        expect(result1.expiresIn).toBe(60);
        expect(result2.expiresIn).toBe(86400);
      });
    });
  });

  describe('Service Integration', () => {
    it('should handle upload and delete lifecycle', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');
      mockSend.mockResolvedValue({});

      // Act - Upload
      const uploadResult = await service.generatePresignedUploadUrl(
        'test-resume.pdf',
        'application/pdf',
        S3Folder.RESUMES
      );

      expect(uploadResult).toBeDefined();
      expect(uploadResult.fileKey).toMatch(/^resumes\/[0-9a-f-]+\.pdf$/);

      // Act - Delete
      const deleteResult = await service.deleteFile(uploadResult.fileKey);

      // Assert
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.message).toContain(uploadResult.fileKey);
    });

    it('should handle multiple upload-delete cycles', async () => {
      // Arrange
      mockGetSignedUrl.mockResolvedValue('https://signed-url');
      mockSend.mockResolvedValue({});

      // Act - Cycle 1
      const upload1 = await service.generatePresignedUploadUrl(
        'resume1.pdf',
        'application/pdf'
      );
      const delete1 = await service.deleteFile(upload1.fileKey);

      // Act - Cycle 2
      const upload2 = await service.generatePresignedUploadUrl(
        'resume2.pdf',
        'application/pdf'
      );
      const delete2 = await service.deleteFile(upload2.fileKey);

      // Assert
      expect(delete1.success).toBe(true);
      expect(delete2.success).toBe(true);
      expect(upload1.fileKey).not.toBe(upload2.fileKey);
    });
  });
});
