import { S3Client } from '@aws-sdk/client-s3';

/**
 * S3 Client singleton
 * Automatically uses credentials from environment variables:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_REGION
 */
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

/**
 * S3 Configuration
 */
const DEFAULT_UPLOAD_EXPIRY = 300; // 5 minutes
const rawUploadExpiry = process.env.S3_UPLOAD_EXPIRY;
const parsedUploadExpiry = Number.parseInt(
  rawUploadExpiry != null && rawUploadExpiry !== ''
    ? rawUploadExpiry
    : String(DEFAULT_UPLOAD_EXPIRY),
  10
);
const uploadExpiry =
  Number.isNaN(parsedUploadExpiry) || parsedUploadExpiry <= 0
    ? DEFAULT_UPLOAD_EXPIRY
    : parsedUploadExpiry;
export const s3Config = {
  bucketName: process.env.S3_BUCKET_NAME || 'jobly-dev-assets',
  region: process.env.AWS_REGION || 'ap-southeast-1',
  uploadExpiry,
};
